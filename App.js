// /cultural_heritage_portal/App.js
import {
    renderHeaderShell,
    initializeHeaderInteractions, 
    UserTimelineView,
    AdminAuditorDashboard,
    SuperAdminConsole,
    renderProfileSettingsWorkspace,
    renderGenealogyTree,
    renderChatInterface,
    initializeMessengerProfessionalInteractions, 
    renderDictionaryWorkspace,      
    initializeProfileFormInteractions,
    initializeTimelineInteractions,
    initializeMediaScrollObserver
} from './components/PortalLayout.js';

import {renderResearchGateWorkspace} from './components/ResearchWorkspace.js'
import { MediaStreamWorkspaceView } from './components/MediaStreamWorkspace.js';

import {
    initGlobalNavigation,
    initScrollAnimations,
    initHomeSlidersAndCounters,
    initPreviewSystem,
    initAuthFormEngine,
    initializeArchiveCoreControllers,
    initializeInfiniteScrollTimeline,    
    destroyInfiniteScrollTimeline       
} from './Javascript/js.js';

import { Header } from './components/Header.js';
import { Home } from './components/home.js';
import { About } from './components/about.js';
import { Explore } from './components/explore.js';
import { AdminExplore, initAdminAuthFormEngine } from './components/AdminExplore.js'; 
import { Footer } from './components/footer.js';

let currentUserSession = null;
let appState = { chatThreads: [], activeThread: null };

// Centralized state tracker for media uploads
window.selectedFilesTrackerMemory = [];

/**
 * Universal safe wrapper for JSON API requests
 */
async function safeFetchJSON(url, options = {}) {
    try {
        const response = await fetch(url, options);
        const contentType = response.headers.get('content-type');
        
        if (response.ok && contentType && contentType.includes('application/json')) {
            return await response.json();
        } else {
            const errorText = await response.text();
            console.error(`API Error [${url}] Status [${response.status}]:`, errorText);
            return null; 
        }
    } catch (e) {
        console.error(`Network communication breakdown reaching: ${url}`, e);
        return null;
    }
}

/**
 * Handle logins and signups for public views
 */
function mountAuthFormInterceptors() {
    const loginForm = document.getElementById('loginForm');
    const loginErrorElement = document.getElementById('err');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (loginErrorElement) loginErrorElement.innerText = '';

            const formData = new FormData(loginForm);
            const payload = Object.fromEntries(formData.entries());

            try {
                const response = await fetch('api/auth/login.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }, 
                    body: JSON.stringify(payload) 
                });

                const contentType = response.headers.get('content-type');
                
                if (contentType && contentType.includes('application/json')) {
                    const result = await response.json();
                    
                    if (result.success) {
                        currentUserSession = result.user;
                        window.location.hash = '#posts';
                    } else {
                        if (loginErrorElement) loginErrorElement.innerText = result.message || "Invalid credentials.";
                    }
                } else {
                    const errorText = await response.text();
                    console.error("Server returned an invalid format:", errorText);
                    if (loginErrorElement) {
                        loginErrorElement.innerText = `Server error (${response.status}). Check backend logs.`;
                    }
                }
            } catch (err) {
                console.error("Login communication breakdown:", err);
                if (loginErrorElement) loginErrorElement.innerText = "Network connection error.";
            }
        });
    }

    const signupForm = document.getElementById('signupForm');
    const signupErrorElement = document.getElementById('error-message');
    
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const payload = {
                first_name: document.getElementById('fname')?.value,
                surname: document.getElementById('sname')?.value,
                phone_number: document.getElementById('phoneNo')?.value,
                email: document.getElementById('email')?.value,
                tribe: document.getElementById('tribeSelect')?.value,
                tribe_specified: document.getElementById('tribeSpecify')?.value,
                password: document.getElementById('spassword')?.value,
                confirm_password: document.getElementById('cpassword')?.value,
            };

            try {
                const response = await fetch('api/auth/signup.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const result = await response.json();

                if (result.success) {
                    alert("Registration successful! Please log in.");
                    document.getElementById('authWrapper')?.classList.remove('right-panel-active');
                } else {
                    if (signupErrorElement) {
                        signupErrorElement.style.display = 'block';
                        signupErrorElement.querySelector('.error-text').innerText = result.message || "Registration failed.";
                    }
                }
            } catch (err) {
                console.error("Signup submission failure:", err);
            }
        });
    }
}

/**
 * Handle user settings alterations
 * DEPRECATED: Standardized to use initializeProfileFormInteractions() dynamically on route change.
 */
function mountProfileSettingsInterceptors() {
    // Retained as an alias to avoid dependency breaks, delegates to the comprehensive form binder
    initializeProfileFormInteractions();
}

/**
 * Single, unified Media Post Composer configuration.
 * Solves the collision between layout views and execution routines.
 */
function mountFacebookModalComposerInterceptors() {
    const triggerBtn = document.getElementById('fbTriggerModalBtn');
    const overlayModal = document.getElementById('fbComposerModalOverlay');
    const closeBtn = document.getElementById('closeFbModalBtn');
    const mediaInput = document.getElementById('composerMediaFileInput');
    const previewPanel = document.getElementById('mediaCollectionPreviewPanel');
    const postForm = document.getElementById('fbPostComposerForm');

    if (!triggerBtn || !overlayModal) return;

    // Prevent stacking duplicate event listeners on router/view re-renders
    if (triggerBtn.dataset.listenerAttached === 'true') return;
    triggerBtn.dataset.listenerAttached = 'true';

    // Safely ensure our memory tracker array is initialized
    if (!Array.isArray(window.selectedFilesTrackerMemory)) {
        window.selectedFilesTrackerMemory = [];
    }

    triggerBtn.addEventListener('click', () => {
        overlayModal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; 
    });

    const cleanClose = () => {
        overlayModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        if (postForm) postForm.reset();
        if (previewPanel) previewPanel.innerHTML = '';
        window.selectedFilesTrackerMemory = [];
        if (mediaInput) mediaInput.value = "";
    };

    if (closeBtn) {
        closeBtn.addEventListener('click', cleanClose);
    }

    overlayModal.addEventListener('click', (e) => {
        if (e.target === overlayModal) cleanClose();
    });

    if (mediaInput && previewPanel) {
        mediaInput.addEventListener('change', () => {
            const newlySelected = Array.from(mediaInput.files);
            window.selectedFilesTrackerMemory = window.selectedFilesTrackerMemory.concat(newlySelected);

            previewPanel.innerHTML = ''; 
            window.selectedFilesTrackerMemory.forEach((file, index) => {
                const wrapper = document.createElement('div');
                wrapper.style.cssText = "position:relative; width:80px; height:80px; border-radius:6px; overflow:hidden; background:#f0f2f5; border:1px solid #ddd;";
                
                if (file.type.startsWith('image/')) {
                    const img = document.createElement('img');
                    img.src = URL.createObjectURL(file);
                    img.style.cssText = "width:100%; height:100%; object-fit:cover;";
                    wrapper.appendChild(img);
                } else if (file.type.startsWith('audio/')) {
                    wrapper.style.display = "flex";
                    wrapper.style.alignItems = "center";
                    wrapper.style.justifyContent = "center";
                    wrapper.innerHTML = `<i class="fa-solid fa-file-audio" style="font-size:28px; color:#1877f2;"></i>`;
                } else if (file.type.startsWith('video/')) {
                    wrapper.style.display = "flex";
                    wrapper.style.alignItems = "center";
                    wrapper.style.justifyContent = "center";
                    wrapper.innerHTML = `<i class="fa-solid fa-file-video" style="font-size:28px; color:#f3425f;"></i>`;
                }

                // Delete trigger for individual selected files
                const deleteBadge = document.createElement('span');
                deleteBadge.innerHTML = "&times;";
                deleteBadge.style.cssText = "position:absolute; top:2px; right:2px; background:rgba(0,0,0,0.6); color:#fff; width:18px; height:18px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:12px; cursor:pointer; z-index:10;";

                deleteBadge.addEventListener('click', (event) => {
                    event.stopPropagation();
                    window.selectedFilesTrackerMemory.splice(index, 1);
                    mediaInput.value = ""; // Clear reference to allow re-triggering changes
                    mediaInput.dispatchEvent(new Event('change'));
                });

                wrapper.appendChild(deleteBadge);
                previewPanel.appendChild(wrapper);
            });
        });
    }

    if (postForm) {
        postForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const packedPayload = new FormData(postForm);
            
            // Clean out mismatch identifiers
            packedPayload.delete('media_files[]');
            packedPayload.delete('media[]');

            // FIX: Unified payload under the common 'media[]' field
            window.selectedFilesTrackerMemory.forEach(file => {
                packedPayload.append('media[]', file);
            });

            try {
                const response = await fetch('api/posts/create.php', {
                    method: 'POST',
                    body: packedPayload 
                });

                const data = await response.json();
                if (response.ok && data.success) {
                    alert(data.message || "Post published successfully!");
                    cleanClose();
                    if (typeof window.router === 'function') {
                        window.router(); 
                    }
                } else {
                    alert(data.message || "Failed to submit post content files.");
                }
            } catch (err) {
                console.error("Critical submission break trace:", err);
                alert("Network communication failure logging post asset objects.");
            }
        });
    }
}

/**
 * Global Admin audit queue tools
 */
// Ensure window.executeAuditAction explicitly clears the DOM elements on success
// FIX: Replace the element clearing block inside window.executeAuditAction in App.js:
window.executeAuditAction = async function (postId, action) {
    if (!confirm(`Are you sure you want to ${action} this post?`)) return;

    try {
        const response = await fetch('api/posts/review.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                post_id: postId,
                status: action === 'approve' ? 'approved' : 'rejected'
            })
        });
        const result = await response.json();

        if (result && result.success) {
            alert(`Post successfully ${action}d.`);
            
            // FIX: Search for the table row or card layout dynamically and remove it
            const rowItem = document.querySelector(`tr[data-post-id="${postId}"], #post-card-container-${postId}, #queue-item-${postId}`);
            if (rowItem) {
                rowItem.remove();
            }
            
            // Re-trigger the layout workspace update to sync state cleanly
            if (typeof window.router === 'function') {
                window.router();
            }
        } else {
            alert(`Failed to complete action: ${result ? result.message : 'Unknown error.'}`);
        }
    } catch (err) {
        console.error("Audit action structural error:", err);
    }
};


/**
 * Unified Post Like Trigger
 */
window.togglePostLikeAction = async function (postId) {
    try {
        const response = await fetch('api/feed/like.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ post_id: postId })
        });
        const result = await response.json();
        if (result.success) {
            if (window.location.hash === '#posts' || window.location.hash === '') {
                router(); 
            }
        }
    } catch (err) {
        console.error("Like interaction error tracking sync failed:", err);
    }
};

// Aliased fallback mapping for togglePostLikeState
window.togglePostLikeState = window.togglePostLikeAction;

/**
 * Unified Comments Dispatcher
 */
window.submitPostCommentAction = async function (event, postId) {
    event.preventDefault();
    const inputField = document.getElementById(`comment-input-${postId}`);
    const commentText = inputField?.value.trim();

    if (!commentText) return;

    try {
        const response = await fetch('api/feed/comment.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ post_id: postId, comment_text: commentText })
        });
        const result = await response.json();

        if (result.success) {
            if (inputField) inputField.value = '';
            router();
        } else {
            alert("Comment system pipeline failure: " + result.message);
        }
    } catch (err) {
        console.error("Critical error dispatching social comment payload stream:", err);
    }
};


// Add this in app.js alongside your state/routing handlers
window.returnToUserList = function () {
    // 1. Clear global active thread state
    if (window.appState) {
        window.appState.activeThread = null;
    }
    
    // 2. Clear mobile chat view class (if element exists)
    const frame = document.querySelector('.messenger-workspace-frame');
    if (frame) {
        frame.classList.remove('chat-active');
    }

    // 3. Delegate to active channel loader or router fallback
    if (typeof window.loadActiveChatChannel === 'function') {
        window.loadActiveChatChannel(null);
    } else if (window.router) {
        window.location.hash = '#messenger';
        window.router();
    }
};

// =========================================================================
// Central Router Workspace Engine
// =========================================================================
async function router() {
    const appRoot = document.getElementById('root-app-target');
    const portalHeaderMount = document.getElementById('header');
    const portalFooterMount = document.getElementById('footer');

    if (!appRoot) return;

    let currentHash = window.location.hash || '#home';
    const isPublicRoute = ['#home', '#about', '#explore', '#AdminExplore'].includes(currentHash);

    if (typeof destroyInfiniteScrollTimeline === 'function') {
        destroyInfiniteScrollTimeline();
    }
 
    if (!currentUserSession) {
        const sessionData = await safeFetchJSON('api/auth/me.php');
        if (sessionData && sessionData.loggedIn && sessionData.user) {
            currentUserSession = sessionData.user;
        } else {
            if (!isPublicRoute) {
                if (!window.location.pathname.includes('login.php')) {
                    window.location.href = '#explore';
                }
                return;
            }
        }
    }

    const isMobile = window.innerWidth <= 768;

    if (portalHeaderMount) {
        if (currentUserSession && !isPublicRoute) {
            let notificationCount = 0;
            const badgeData = await safeFetchJSON('api/notifications/badge.php').catch(() => null);
            if (badgeData && badgeData.success) {
                notificationCount = badgeData.unread_count || 0;
            }
            portalHeaderMount.innerHTML = renderHeaderShell(currentUserSession, currentHash, notificationCount);
            //  // INCLUDE THE CALL HERE TO BIND HAMBURGER MENU CLICK EVENTS // ======================================================== 
            initializeHeaderInteractions();
        } else {
            portalHeaderMount.innerHTML = Header(currentUserSession, isMobile, currentHash);
        }
        initGlobalNavigation();
    }

    try {
        if (currentHash === '#home') {
            appRoot.innerHTML = Home();
            if (portalFooterMount) portalFooterMount.innerHTML = Footer(isMobile, 'index.html');
            try { initHomeSlidersAndCounters(); } catch (e) { console.warn("Swiper bypass:", e.message); }
            initScrollAnimations();
            return;

        } else if (currentHash === '#about') {
            appRoot.innerHTML = About();
            if (portalFooterMount) portalFooterMount.innerHTML = Footer(isMobile, 'about.html');
            initScrollAnimations();
            return;

        } else if (currentHash === '#explore') {
            const loggedInState = currentUserSession ? true : false;
            appRoot.innerHTML = Explore(loggedInState);
            if (portalFooterMount) portalFooterMount.innerHTML = Footer(isMobile, 'explore.html');
            initScrollAnimations();
            initPreviewSystem();
            if (!loggedInState) {
                initAuthFormEngine();
                mountAuthFormInterceptors();
            }
            return;

        } else if (currentHash === '#AdminExplore') {
            if (currentUserSession && (currentUserSession.role === 'admin' || currentUserSession.role === 'super_admin')) {
                window.location.hash = '#management';
                return;
            }
            appRoot.innerHTML = AdminExplore();
            if (portalFooterMount) portalFooterMount.innerHTML = Footer(isMobile, 'explore.html');
            initScrollAnimations();
            
            initAdminAuthFormEngine((authenticatedUser) => {
                currentUserSession = authenticatedUser;
                window.location.hash = '#management';
                window.location.reload();
            });
            return;

        }  else if (currentHash === '#posts') {
    
    if (portalFooterMount) portalFooterMount.innerHTML = '';
    const data = await safeFetchJSON('api/posts/feed.php');

    if (data) {
        appRoot.innerHTML = UserTimelineView(currentUserSession, data.feed || []); 

        const searchInput = document.getElementById('globalFeedSearchEngine');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase();
                document.querySelectorAll('.timeline-stream .cultural-card').forEach(card => {
                    card.style.display = card.textContent.toLowerCase().includes(term) ? 'block' : 'none';
                });
            });
        }

        // Safer microtask execution to prevent race conditions on dynamic DOM nodes
        queueMicrotask(() => {
            initializeTimelineInteractions(); // <-- Binds composer, preview files, and submit interceptors cleanly
            initializeMediaScrollObserver(); // <-- Auto-plays feed videos when they scroll into view
        });

        if (typeof initializeInfiniteScrollTimeline === 'function') {
            initializeInfiniteScrollTimeline();
        }
    } else {
        appRoot.innerHTML = `<div class="error-404-container"><h4>Failed to retrieve posts workspace feed.</h4></div>`;
    }
    return;
    
    } 
    else if (currentHash === '#watch-reels') {
            if (portalFooterMount) portalFooterMount.innerHTML = '';
            appRoot.innerHTML = `<div id="mainWorkspaceContentAnchor" style="min-height: 80vh;">${MediaStreamWorkspaceView(currentUserSession)}</div>`;
            return;

        } else if (currentHash === '#profile') {
            if (portalFooterMount) portalFooterMount.innerHTML = '';
            appRoot.innerHTML = renderProfileSettingsWorkspace(currentUserSession);
            
            // Standardize initialization logic across assets and input values
            initializeArchiveCoreControllers();
            initializeProfileFormInteractions(); // <-- FIX: Executes real-time photo rendering and profile saves instantly on view paint
            return;

        } else if (currentHash === '#management') {
            if (portalFooterMount) portalFooterMount.innerHTML = '';
            if (!currentUserSession) return;

            let panelContent = '';
            if (currentUserSession.role === 'admin') {
                const data = await safeFetchJSON('api/posts/read_audit_queue.php');
                panelContent = AdminAuditorDashboard(data ? (data.queue || data.pendingPosts || []) : []);
            } else if (currentUserSession.role === 'super_admin') {
                const usersData = await safeFetchJSON('api/admin/read_users.php');
                const queueData = await safeFetchJSON('api/posts/read_audit_queue.php');
                panelContent = SuperAdminConsole(
                    usersData ? (usersData.users || []) : [], 
                    queueData ? (queueData.queue || []) : []
                );
            } else {
                appRoot.innerHTML = `<div class="forbidden-alert-container">Access Denied. Administrative clearance required.</div>`;
                return;
            }

            appRoot.innerHTML = `
            <div class="dict-container">
                <div class="search-engine-wrapper" style="margin-bottom: 20px;">
                    <div class="search-bar-container" style="display:flex; background:#fff; border:1px solid var(--fb-border); border-radius:8px; padding:10px 16px; align-items:center;">
                        <i class="fa-solid fa-user-shield" style="color:var(--fb-accent); margin-right:12px; font-size:16px;"></i>
                        <input type="text" id="clearanceHubSearchEngine" placeholder="Filter audit queue items..." style="border:none; width:100%; outline:none; font-size:14px;">
                    </div>
                </div>
                <div id="clearanceDashboardAnchorPanel">${panelContent}</div>
            </div>`;

            const hubSearch = document.getElementById('clearanceHubSearchEngine');
            if (hubSearch) {
                hubSearch.addEventListener('input', (e) => {
                    const term = e.target.value.toLowerCase();
                    document.querySelectorAll('#clearanceDashboardAnchorPanel table tbody tr, #clearanceDashboardAnchorPanel .cultural-card').forEach(row => {
                        row.style.display = row.textContent.toLowerCase().includes(term) ? '' : 'none';
                    });
                });
            }
            return;

        } else if (currentHash === '#genealogy') {
            if (portalFooterMount) portalFooterMount.innerHTML = '';
            const data = await safeFetchJSON('api/genealogy/tree_view.php');
            appRoot.innerHTML = renderGenealogyTree(data ? (data.tree || {}) : {});
            return;

        } else if (currentHash === '#dictionary') {
            if (portalFooterMount) portalFooterMount.innerHTML = '';
            
            // Fixed: Delegate rendering directly to PortalLayout template to keep markup in sync
            appRoot.innerHTML = renderDictionaryWorkspace(null, []);
            
            if (typeof initDictionaryEngine === 'function') {
                initDictionaryEngine();
            }

            const dictSearch = document.getElementById('dictionarySearchEngine');
            if (dictSearch) {
                dictSearch.addEventListener('input', (e) => {
                    const term = e.target.value.toLowerCase();
                    document.querySelectorAll('#dictionaryWordsContainer .dict-word-item').forEach(item => {
                        item.style.display = item.textContent.toLowerCase().includes(term) ? 'block' : 'none';
                    });
                });
            }
            return;

        } else if (currentHash === '#research') {
            if (portalFooterMount) portalFooterMount.innerHTML = '';
            
            const resData = await safeFetchJSON('api/posts/read_research.php').catch(() => null);
            const articles = resData && resData.success ? resData.articles : [];

            // Fixed: Delegate rendering directly to PortalLayout template to keep markup in sync
            appRoot.innerHTML = renderResearchGateWorkspace(currentUserSession, {posts: articles});

            const researchSearch = document.getElementById('researchVaultSearchEngine');
            if (researchSearch) {
                researchSearch.addEventListener('input', (e) => {
                    const term = e.target.value.toLowerCase();
                    document.querySelectorAll('#researchItemsCollectionGrid .research-item-box').forEach(box => {
                        box.style.display = box.textContent.toLowerCase().includes(term) ? 'block' : 'none';
                    });
                });
            }
            
            // FIX: FIRE THE INTERCEPTION LURKER HERE ONCE THE THE CANVA DISPLAYS 
            queueMicrotask(() => { 
           
            if (typeof window.initializeDirectDesktopIngestHook === 'function') { window.initializeDirectDesktopIngestHook();
             } 
             
             });
            return;

        } 
        else if (currentHash === '#messenger') {
            if (portalFooterMount) portalFooterMount.innerHTML = '';
            
            let chatData = null;
            try {
                chatData = await safeFetchJSON('api/chat/directory.php');
            } catch (err) {
                console.warn("Unable to extract messaging registry payload safely:", err.message);
            }

            if (chatData && chatData.success) {
                appState.chatThreads = chatData.threads || [];
                appState.activeThread = chatData.activeThread || null;

                appRoot.innerHTML = ` <div id="mainWorkspaceContentAnchor"> ${renderChatInterface(appState.activeThread, appState.chatThreads)} </div> `;

                const msgSearch = document.getElementById('messengerDirectorySearchEngine');
                if (msgSearch) {
                    msgSearch.addEventListener('input', (e) => {
                        const term = e.target.value.toLowerCase();
                        document.querySelectorAll('#messengerMainInterfaceMount .thread-item, #messengerMainInterfaceMount .user-chat-row').forEach(el => {
                            el.style.display = el.textContent.toLowerCase().includes(term) ? '' : 'none';
                        });
                    });
                }
            } else {
                appRoot.innerHTML = `
                <div class="dict-container" style="max-width: 600px; margin: 40px auto;">
                    <div class="dict-card" style="text-align: center; padding: 40px 24px;">
                        <i class="fa-solid fa-message-slash" style="font-size: 48px; color: var(--fb-text-secondary); margin-bottom: 16px;"></i>
                        <h4>Messenger Channels Offline</h4>
                        <p style="color: var(--fb-text-secondary); margin-bottom: 0;">The data request pointer is set to <code style="background:#f0f2f5; padding:2px 6px; border-radius:4px;">api/chat/directory.php</code>, but it could not be resolved.</p>
                    </div>
                </div>`;
            }
            return;

        } else if (currentHash === '#notifications') {
            if (portalFooterMount) portalFooterMount.innerHTML = '';
            appRoot.innerHTML = `
            <div class="dict-container" style="max-width: 680px; margin: 20px auto;">
                <div class="dict-card" style="padding: 20px;">
                    <h3 style="margin-top:0;"><i class="fa-solid fa-bell" style="color: #f5a623;"></i> System Alerts & Updates Log</h3>
                    <hr style="border:0; border-top:1px solid var(--fb-border); margin:12px 0;">
                    <p style="color: var(--fb-text-secondary); text-align:center; padding:40px 0; margin:0;">
                        No pending structural administrative warnings found.
                    </p>
                </div>
            </div>`;
            return;

        } else {
            appRoot.innerHTML = `<div class="error-404-container"><h4>Workspace route "${currentHash}" not found.</h4></div>`;
        }
    } catch (routerError) {
        console.error("Routing execution breakdown:", routerError);
        appRoot.innerHTML = `<div class="network-error-state">Communication failure updating system workspace.</div>`;
    }
}

/**
 * Fallback Inline Timeline Post submission
 */
function mountTimelineInterceptors() {
    const postForm = document.getElementById('dynamicPostForm');
    if (!postForm) return;

    postForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = new FormData(postForm);
        try {
            const response = await fetch('api/posts/create.php', {
                method: 'POST',
                body: payload
            });
            const result = await response.json();
            if (result.success) { 
                alert("Archival submission registered."); 
                router(); 
            }
        } catch (err) { 
            console.error("Timeline insertion crash:", err); 
        }
    });
}

/**
 * Universal User Logout Route
 */
window.logout = async function () {
    try {
        await fetch('api/auth/logout.php', { method: 'POST' });
        currentUserSession = null;
        window.location.hash = '#home';
    } catch (err) { window.location.reload(); }
};

window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', router);

/**
 * Chat System Thread Handlers
 */
window.loadActiveChatChannel = async function(userId) {
    const workspaceTarget = document.getElementById('mainWorkspaceContentAnchor');
    if (!workspaceTarget) return;

    workspaceTarget.innerHTML = `
    <div style="display:flex; justify-content:center; align-items:center; height:60vh; font-family:sans-serif; color:#65676b;">
        <div style="text-align:center;"><i class="fa-solid fa-circle-notch fa-spin" style="font-size:2rem; color:#1877f2; margin-bottom:10px;"></i><p>Synchronizing communication threads...</p></div>
    </div>`;

    try {
        const response = await fetch(`api/chat/messages.php?with=${userId}`);
        const result = await response.json();

        const dirResponse = await fetch('api/chat/directory.php');
        const dirResult = await dirResponse.json();
        const threadsList = dirResult.success ? dirResult.threads : [];

        /* Inside window.loadActiveChatChannel in App.js */
if (result.success) {
    const activeThread = {
        id: userId,
        first_name: result.recipient.first_name,
        surname: result.recipient.surname,
        profile_pic: result.recipient.profile_pic,
        messages: result.messages
    };

    // 1. Render the HTML layout from your updated file chassis safely
    workspaceTarget.innerHTML = renderChatInterface(activeThread, threadsList);
    
    // 2. PASS THE CONTEXT ARGUMENT: Blocks the crash by providing the recipient variable context
    initializeMessengerProfessionalInteractions(userId); 
    
    const scroller = document.getElementById('chatMessageScrollerBodyDock');
    if (scroller) scroller.scrollTop = scroller.scrollHeight;
} else {
            workspaceTarget.innerHTML = `<div style="padding:20px; color:#f3425f;">Failed loading thread conversation metrics.</div>`;
        }
    } catch (err) {
        console.error("Chat routing failure handler logs:", err);
        workspaceTarget.innerHTML = `<div style="padding:20px; color:#f3425f;">Server connection error during routing configuration.</div>`;
    }
};

