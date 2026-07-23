// /cultural_heritage_portal/app.js

// 1. Core Component Engine Imports
import { api } from '/cultural_heritage_portal/components/api.js';
import { Header } from '/cultural_heritage_portal/components/Header.js';
import { Footer } from '/cultural_heritage_portal/components/Footer.js';

// 2. View Domain Layer Imports
import { Home } from '/cultural_heritage_portal/components/Home.js';
import { About } from '/cultural_heritage_portal/components/About.js';
import { Explore } from '/cultural_heritage_portal/components/Explore.js';


// 3. System Credentials & Interceptor Operations
import { initAdminLoginForm } from './components/admin-auth-component.js';
import { initAuthForm, initSignupForm } from './components/auth-component.js';
import { 
    mountTimelineInterceptors, 
    syncRegistryRecord,
    initGlobalNavigation,
    initScrollAnimations,
    initHomeSlidersAndCounters,
    initPreviewSystem,
    initAuthFormEngine
} from '/cultural_heritage_portal/Javascript/js.js';

// 4. Layout Generation Sub-routines (Unified Import from singular layout location)
import { 
    renderHeaderShell, 
    UserTimelineView, 
    AdminAuditorDashboard, 
    SuperAdminConsole, 
    renderProfileSettingsWorkspace,
    renderGenealogyTree,
    renderChatInterface 
} from './components/PortalLayout.js';

// Global System Variables
const isMobile = window.innerWidth < 768;
let currentUserSession = null;
let globalCachedFeed = []; 
let platformUsers = [];    

/**
 * Global Operational Interceptors bound to window for dynamic template elements
 */
window.executeAuditAction = async function(postId, decision) {
    try {
        const response = await fetch('api/admin/audit_post.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ post_id: postId, status: decision })
        });

        const rawText = await response.text();
        const jsonStart = rawText.indexOf('{');
        const jsonEnd = rawText.lastIndexOf('}');
        
        if (jsonStart === -1 || jsonEnd === -1) throw new Error("Non-JSON structure detected");
        const data = JSON.parse(rawText.substring(jsonStart, jsonEnd + 1));

        if (data.success) {
            const cardEl = document.getElementById(`queue-item-${postId}`);
            if (cardEl) {
                cardEl.style.transition = 'all 0.3s ease';
                cardEl.style.opacity = '0';
                setTimeout(() => cardEl.remove(), 300);
            }
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error("Audit terminal communication failure:", error);
    }
};

window.escalateUserPrivilege = async function(userId) {
    if (!confirm("Are you sure you want to promote this user to a system Admin Auditor?")) return;
    try {
        const response = await fetch('api/admin/promote_user.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, role: 'admin' })
        });
        const data = await response.json();
        if (data.success) {
            alert("User role successfully updated.");
            window.location.reload();
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error("Failed executing role promotion pipeline:", error);
    }
};

window.logout = function() {
    currentUserSession = null;
    globalCachedFeed = [];
    window.location.hash = '#explore';
    router();
};

window.loadActiveChatThread = function(recipientId) {
    window.location.hash = `#chat?with=${recipientId}`;
};

window.toggleDarkMode = function() {
    document.body.classList.toggle('dark-mode');
};

/**
 * Local Timeline Page Synchronization Workflow
 */
function initTimelinePage(currentPosts) {
    const appRoot = document.getElementById('root-app-target');
    if (!appRoot) return;
    
    appRoot.innerHTML = UserTimelineView(currentPosts);

    mountTimelineInterceptors((newPayload) => {
        syncRegistryRecord(newPayload, (savedPostFromServer) => {
            alert("Record submitted successfully! It has been routed to the Auditor Ingestion Queue for review.");
        });
    });
}

/**
 * Event Listener Delegation for Administrative Decisions
 */
export function initAdminActions() {
    const queueStream = document.getElementById('live-admin-queue');
    if (!queueStream) return;

    queueStream.addEventListener('click', async (e) => {
        const targetButton = e.target.closest('.audit-action-btn');
        if (!targetButton) return;

        const postId = targetButton.getAttribute('data-id');
        const decision = targetButton.getAttribute('data-action');
        await window.executeAuditAction(postId, decision);
    });
}

/**
 * Binds Asynchronous Profile Avatar and Cover Photo Multi-part Streams
 */
function bindProfileUploadListeners() {
    const avatarInput = document.getElementById('avatarImageNativeInput');
    const coverInput = document.getElementById('coverImageNativeInput');

    const executeUploadFetch = (file, keyName) => {
        if (!file) return;

        const payload = new FormData();
        payload.append(keyName, file);

        fetch('api/profile/update.php', {
            method: 'POST',
            body: payload
        })
        .then(response => {
            if (!response.ok) throw new Error("Network response failure.");
            return response.json();
        })
        .then(data => {
            if (data.success) {
                window.location.reload();
            } else {
                alert(data.message);
            }
        })
        .catch(err => {
            console.error("Asynchronous asset stream compilation error:", err);
            alert("Could not process dynamic photo sync.");
        });
    };

    if (avatarInput) {
        avatarInput.addEventListener('change', (e) => {
            executeUploadFetch(e.target.files[0], 'avatar_media_asset');
        });
    }

    if (coverInput) {
        coverInput.addEventListener('change', (e) => {
            executeUploadFetch(e.target.files[0], 'cover_media_asset');
        });
    }
}

/**
 * Single Page Application Router Engine
 */
async function router() {
    const currentHash = window.location.hash || '#home';
    const appRoot = document.getElementById('root-app-target');
    
    const legacyHeader = document.getElementById('header');
    const legacyFooter = document.getElementById('footer');
    const portalHeaderMount = document.getElementById('portal-header-mount');

    if (!appRoot) return;

    // CONTEXT-DRIVEN DISPLAY ENGINE: Navigation Visibility Management
    if (currentUserSession) {
        if (legacyHeader) { legacyHeader.innerHTML = ''; legacyHeader.style.display = 'none'; }
        if (legacyFooter) { legacyFooter.innerHTML = ''; legacyFooter.style.display = 'none'; }
        
        if (portalHeaderMount) {
            portalHeaderMount.innerHTML = renderHeaderShell(currentUserSession, currentHash);
            portalHeaderMount.style.display = 'block';
        }
    } else {
        if (portalHeaderMount) { portalHeaderMount.innerHTML = ''; portalHeaderMount.style.display = 'none'; }
        
        if (legacyHeader) {
            legacyHeader.style.display = 'block';
            legacyHeader.innerHTML = Header(currentUserSession, isMobile, currentHash);
        }
        if (legacyFooter) {
            legacyFooter.style.display = 'block';
            legacyFooter.innerHTML = Footer(isMobile, currentHash);
        }

        // Redirect anonymous users out of secured states
        if (currentHash === '#PortalLayout' || currentHash === '#admin-dashboard' || currentHash === '#super-admin-dashboard') {
            window.location.hash = '#explore';
            return;
        }
    }

    // --- APPLICATION VIEW ROUTING CHASSIS ---
    
    // 1. HOME VIEW ROUTER
    if (currentHash === '#home' || currentHash === '') {
        if (globalCachedFeed.length === 0) {
            try {
                const response = await api('/posts/feed.php');
                if (response && response.success) globalCachedFeed = response.feed;
            } catch (e) {
                console.error("Failed gathering public cultural feed streams:", e);
            }
        }

        if (currentUserSession) {
            appRoot.innerHTML = UserTimelineView(globalCachedFeed);
            bindComposerInterceptor();
        } else {
            appRoot.innerHTML = Home(currentUserSession, globalCachedFeed);
            initHomeSlidersAndCounters();
            initPreviewSystem();
        }
    }

    // 2. ABOUT VIEW ROUTER
    else if (currentHash === '#about') {
        appRoot.innerHTML = About();
    }

    // 3. EXPLORE VIEW ROUTER
    else if (currentHash === '#explore') {
        appRoot.innerHTML = Explore(!!currentUserSession, isMobile);

        if (!currentUserSession) {
            initAuthForm();
            initSignupForm();
            initAuthFormEngine();
        }
    }

  // 4. TIMELINE ARCHIVE / USER PROFILE ROUTER
    else if (currentHash === '#PortalLayout') {
        let personalPosts = [];
        try {
            const response = await api(`/posts/user_posts.php?user_id=${currentUserSession.id}`);
            if (response && response.success) {
                personalPosts = response.posts;
            }
        } catch (err) {
            console.error("Could not load timeline nodes:", err);
        }
        
        // Render UI Cards into the active visible layout viewport
        appRoot.innerHTML = renderProfileSettingsWorkspace(user);
        
        // Immediately connect asynchronous listeners to inputs inside the newly loaded layout card
        bindProfileUploadListeners();
    }

    // 5. ADMINISTRATIVE AUDITOR WORKSPACE DASHBOARD
    else if (currentHash === '#admin-dashboard') {
        let pendingPosts = [];
        try {
            const postsRes = await api('/admin/pending_posts.php');
            if (postsRes && postsRes.success) pendingPosts = postsRes.posts;
        } catch (err) {
            console.error("Failed to fetch administrative data bundles:", err);
        }
        appRoot.innerHTML = AdminAuditorDashboard(pendingPosts);
    }

    // 6. ADMIN SECURITY ACCREDITATION GATEWAY
    else if (currentHash === '#admin-gateway') {
        initAdminLoginForm(); 
    }

    // 7. SYSTEM OWNER / SUPER-ADMIN WORKSPACE DASHBOARD
    else if (currentHash === '#super-admin-dashboard') {
        if (currentUserSession && currentUserSession.role === 'super_admin') {
            let pendingPosts = [];
            try {
                const postsRes = await api('/admin/pending_posts.php');
                if (postsRes && postsRes.success) pendingPosts = postsRes.posts;
                
                const usersRes = await fetch('api/users/list.php');
                platformUsers = await usersRes.json();
            } catch (err) {
                console.error("Super admin console data ingestion error:", err);
            }
            appRoot.innerHTML = SuperAdminConsole(platformUsers, pendingPosts);
        } else {
            appRoot.innerHTML = `<div style="text-align:center; padding:100px; color:#e41e3f; font-weight:bold;">Access Denied. Master clearance parameters required.</div>`;
        }
    }

    // 8. UNIFIED CHAT & AUDITOR CHANNELS ROUTER
    else if (currentHash.startsWith('#chat')) {
        if (!currentUserSession) {
            window.location.hash = '#explore';
            return;
        }

        const hashParts = currentHash.split('?with=');
        const activeRecipientId = hashParts.length > 1 ? hashParts[1] : null;

        let threadsList = [];
        let activeThreadData = null;

        try {
            const directoryRes = await api('/chat/directory.php');
            if (directoryRes && directoryRes.success) threadsList = directoryRes.threads;

            if (activeRecipientId) {
                const streamRes = await api(`/chat/messages.php?with=${activeRecipientId}`);
                if (streamRes && streamRes.success) activeThreadData = streamRes.active_thread;
            }
        } catch (err) {
            console.error("Failed fetching chat messenger data streams:", err);
        }

        appRoot.innerHTML = renderChatInterface(activeThreadData, threadsList);

        const streamArea = document.getElementById('chat-messages-scrollarea');
        if (streamArea) streamArea.scrollTop = streamArea.scrollHeight;

        const chatForm = document.getElementById('chatSubmitChassisForm');
        if (chatForm) {
            chatForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const textInput = document.getElementById('chatMessageInputText');
                const targetId = document.getElementById('chatTargetReceiverId').value;

                if (!textInput.value.trim()) return;

                try {
                    const sendRes = await fetch('api/chat/send.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ receiver_id: targetId, message_text: textInput.value })
                    });
                    const resData = await sendRes.json();
                    if (resData.success) {
                        textInput.value = '';
                        router();
                    }
                } catch (err) {
                    console.error("Message dispatch failure:", err);
                }
            });
        }
    }

    initGlobalNavigation();
    initScrollAnimations();
}

/**
 * Handles toggling inputs and form intercept logic for the timeline composer
 * Updated to allow multi-part binary file attachments for the gallery folder.
 */
function bindComposerInterceptor() {
    const selector = document.getElementById('postTypeSelector');
    if (!selector) return;

    selector.addEventListener('change', (e) => {
        const customWrapper = document.getElementById('customLabelWrapper');
        if (customWrapper) {
            if (e.target.value === 'leading_head') {
                customWrapper.style.display = 'block';
                customWrapper.querySelector('input').setAttribute('required', 'true');
            } else {
                customWrapper.style.display = 'none';
                customWrapper.querySelector('input').removeAttribute('required');
            }
        }
    });

    const form = document.getElementById('dynamicPostForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // RECONCILED: Use FormData directly to allow files to attach and stream
            const formData = new FormData(form);
            
            try {
                const response = await fetch('api/posts/create.php', {
                    method: 'POST',
                    // CRITICAL: Do NOT set Content-Type header here.
                    // Leaving it blank allows the browser to set 'multipart/form-data' automatically.
                    body: formData 
                });
                const resData = await response.json();
                if (resData.success) {
                    alert("Record submitted to ingestion queue successfully.");
                    window.location.reload();
                } else {
                    alert(resData.message);
                }
            } catch (err) {
                console.error("Error creating post submission:", err);
            }
        });
    }
}

// Global hash change watcher attachment
window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', router);
