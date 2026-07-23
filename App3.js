// /cultural_heritage_portal/App.js

// 1. Core Component Engine & Layout Imports
import {
    renderHeaderShell,
    UserTimelineView,
    AdminAuditorDashboard,
    SuperAdminConsole,
    renderProfileSettingsWorkspace,
    renderGenealogyTree,
    renderChatInterface
} from './components/PortalLayout.js';

// 2. LANDING PAGE COMPONENTS
import { Header } from './components/Header.js';
import { Home } from './components/home.js';
import { About } from './components/about.js';
import { Explore } from './components/explore.js';
import { Footer } from './components/footer.js';
import {AdminExplor} from './components/AdminExplore.js';

// 3. LIFECYCLE CONTROLLERS IMPORT
import {
    initGlobalNavigation,
    initScrollAnimations,
    initHomeSlidersAndCounters,
    initPreviewSystem,
    initAuthFormEngine,
    initializeArchiveCoreControllers
} from './Javascript/js.js'; 

// Central Global Application Session Context
let currentUserSession = null;

/**
 * HELPER FUNCTION: Safely fetch JSON response without breaking the router lifecycle
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
            return null; // Return null gracefully instead of crashing the lifecycle
        }
    } catch (e) {
        console.error(`Network communication breakdown reaching: ${url}`, e);
        return null;
    }
}

/**
 * ASYNCHRONOUS AUTHENTICATION SUBMISSION HANDLERS
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
                if (response.ok && contentType && contentType.includes('application/json')) {
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
 * CORE ROUTER AND VIEW DOM ENGINE
 */
async function router() {
    const appRoot = document.getElementById('root-app-target');
    const portalHeaderMount = document.getElementById('header');
    const portalFooterMount = document.getElementById('footer');

    if (!appRoot) return;

    let currentHash = window.location.hash || '#home';
    const isPublicRoute = ['#home', '#about', '#explore', ].includes(currentHash);

    // Sync active user validation states on-the-fly
    if (!currentUserSession) {
        const sessionData = await safeFetchJSON('api/auth/me.php');
        if (sessionData && sessionData.success && sessionData.user) {
            currentUserSession = sessionData.user;
        } else {
            if (!isPublicRoute) {
                if (!window.location.pathname.includes('login.php')) {
                    window.location.href = 'login.php';
                }
                return;
            }
        }
    }

    const isMobile = window.innerWidth <= 768;

    // Handle Header Rendering
   // Handle Header Rendering
    if (portalHeaderMount) {
        if (currentUserSession && !isPublicRoute) {
            let notificationCount = 0;
            // Safe fallback fetch wrapper
            const badgeData = await safeFetchJSON('api/notifications/badge.php').catch(() => null);
            if (badgeData && badgeData.success) {
                notificationCount = badgeData.unread_count || 0;
            }
            portalHeaderMount.innerHTML = renderHeaderShell(currentUserSession, currentHash, notificationCount);
        } else {
            portalHeaderMount.innerHTML = Header(currentUserSession, isMobile, currentHash);
        }
        initGlobalNavigation();
    }

    // ACTIVE EXECUTION ROUTING SWITCH MATRIX
    try {
        if (currentHash === '#home') {
            appRoot.innerHTML = Home();
            if (portalFooterMount) portalFooterMount.innerHTML = Footer(isMobile, 'index.html');
            try {
                initHomeSlidersAndCounters();
            } catch (swiperError) {
                console.warn("Swiper loop bypassed safely:", swiperError.message);
            }
            initScrollAnimations();
            return; // Terminate execution stack cleanly

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

        // --- PROTECTED DASHBOARD SYSTEM WORKSPACES ---
        } else if (currentHash === '#posts') {
            if (portalFooterMount) portalFooterMount.innerHTML = '';
            const data = await safeFetchJSON('api/posts/feed.php');
            
            if (data) {
                appRoot.innerHTML = `
                <div class="search-engine-wrapper" style="max-width: var(--feed-max-width, 680px); margin: 15px auto; padding: 0 16px;">
                    <div class="search-bar-container" style="display:flex; background:#fff; border:1px solid var(--fb-border); border-radius:20px; padding:6px 14px; align-items:center;">
                        <i class="fa-solid fa-magnifying-glass" style="color:var(--fb-text-secondary); margin-right:10px;"></i>
                        <input type="text" id="globalFeedSearchEngine" placeholder="Search institutional posts, oral variants, or metadata tags..." style="border:none; width:100%; outline:none; font-size:14px;">
                    </div>
                </div>
                ${UserTimelineView(data.feed || [])}
                `;
                
                const searchInput = document.getElementById('globalFeedSearchEngine');
                if (searchInput) {
                    searchInput.addEventListener('input', (e) => {
                        const term = e.target.value.toLowerCase();
                        document.querySelectorAll('.timeline-stream .cultural-card').forEach(card => {
                            card.style.display = card.textContent.toLowerCase().includes(term) ? 'block' : 'none';
                        });
                    });
                }
                mountTimelineInterceptors();
            } else {
                appRoot.innerHTML = `<div class="error-404-container"><h4>Failed to retrieve posts workspace feed.</h4></div>`;
            }
            return;

        } else if (currentHash === '#profile') {
            if (portalFooterMount) portalFooterMount.innerHTML = '';
            appRoot.innerHTML = renderProfileSettingsWorkspace(currentUserSession);
            initializeArchiveCoreControllers();
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
            appRoot.innerHTML = `
            <div class="dict-container">
                <div class="dict-header-block">
                    <h3 class="dict-main-title"><i class="fa-solid fa-book-atlas"></i> Lexical Cultural Dictionary</h3>
                    <p class="dict-subtitle">Explore linguistic terminologies, phonetic structures, variants, and context definitions.</p>
                </div>
                <div class="dict-layout">
                    <div class="dict-card">
                        <div class="search-bar-container" style="display:flex; background:var(--fb-bg); border:1px solid var(--fb-border); border-radius:6px; padding:8px 12px; align-items:center; margin-bottom:12px;">
                            <i class="fa-solid fa-filter" style="color:var(--fb-text-secondary); margin-right:8px;"></i>
                            <input type="text" id="dictionarySearchEngine" placeholder="Search terms or dialect variations..." style="border:none; width:100%; background:transparent; outline:none; font-size:13.5px;">
                        </div>
                        <div class="dict-word-list" id="dictionaryWordsContainer">
                            <div class="dict-empty-view">No loaded structural terms recorded yet.</div>
                        </div>
                    </div>
                    <div id="dictionaryDetailTarget" class="dict-card">
                        <div class="dict-empty-view">Select a specific term card from the structural ledger panel to open definitions data.</div>
                    </div>
                </div>
            </div>`;
            
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

            appRoot.innerHTML = `
            <div class="dict-container">
                <div class="fb-profile-split-workspace-grid" style="display: grid; grid-template-columns: 280px 1fr; gap: 20px;">
                    <aside class="research-archive-sidebar-panel dict-card" style="padding: 16px; height: fit-content;">
                        <div class="search-bar-container" style="display:flex; background:var(--fb-bg); border:1px solid var(--fb-border); border-radius:6px; padding:6px 10px; align-items:center; margin-bottom:14px;">
                            <i class="fa-solid fa-magnifying-glass" style="font-size:12px; color:var(--fb-text-secondary); margin-right:6px;"></i>
                            <input type="text" id="researchVaultSearchEngine" placeholder="Search references..." style="border:none; width:100%; background:transparent; outline:none; font-size:12.5px;">
                        </div>
                        <span class="archive-category-uppercase-label" style="display: block; font-weight:700; margin-bottom: 12px; color: var(--fb-text-secondary);">REFERENCE MANUSCRIPTS</span>
                        <ul class="archive-entries-links-stack" style="list-style: none; padding: 0; margin: 0;">
                            <li><a href="#research" class="fb-sidebar-nav-item active" style="background-color: var(--fb-bg);"><i class="fa-solid fa-graduation-cap"></i> Complete Catalog (${articles.length})</a></li>
                        </ul>
                    </aside>
                    <main class="dict-card article-view-canvas-padding" style="padding: 24px;">
                        <h3 style="margin-top: 0;"><i class="fa-solid fa-graduation-cap"></i> Research Gate Vault</h3>
                        <p style="color: var(--fb-text-secondary); line-height: 1.6; margin-bottom: 20px;">Review compiled institutional papers, citation briefs, and archived oral recordings transcript documentation records below:</p>
                        
                        <div class="research-articles-list" id="researchItemsCollectionGrid">
                            ${articles.length === 0 ? '<p class="dict-empty-view">No reference articles or technical studies compiled in repository.</p>' : articles.map(art => `
                                <div class="cultural-card research-item-box" style="padding:16px; margin-bottom:12px; border:1px solid var(--fb-border); background:#fff;">
                                    <h4 class="research-title" style="margin:0 0 8px 0; color:var(--fb-accent); font-weight:700;">${art.title}</h4>
                                    <p style="font-size:13.5px; margin:0 0 10px 0; line-height:1.5;">${art.abstract}</p>
                                    <small style="color:var(--fb-text-secondary); display:block;">Contributor: <b>${art.author_name}</b> | Category: ${(art.category || 'Research').toUpperCase()} | Published: ${new Date(art.created_at).toLocaleDateString()}</small>
                                </div>
                            `).join('')}
                        </div>
                    </main>
                </div>
            </div>`;

            const researchSearch = document.getElementById('researchVaultSearchEngine');
            if (researchSearch) {
                researchSearch.addEventListener('input', (e) => {
                    const term = e.target.value.toLowerCase();
                    document.querySelectorAll('#researchItemsCollectionGrid .research-item-box').forEach(box => {
                        box.style.display = box.textContent.toLowerCase().includes(term) ? 'block' : 'none';
                    });
                });
            }
            return; // Stops execution immediately!

        } else if (currentHash === '#messenger') {
            if (portalFooterMount) portalFooterMount.innerHTML = '';
            
            let chatData = null;
            try {
                chatData = await safeFetchJSON('api/chat/directory.php');
            } catch (err) {
                console.warn("Unable to extract messaging registry payload safely:", err.message);
            }

            if (chatData && chatData.success) {
                appRoot.innerHTML = `
                <div class="search-engine-wrapper" style="max-width: 1200px; margin: 10px auto; padding: 0 20px;">
                    <div class="search-bar-container" style="display:flex; background:#fff; border:1px solid var(--fb-border); border-radius:6px; padding:8px 12px; align-items:center;">
                        <i class="fa-solid fa-comments" style="color:var(--fb-accent); margin-right:10px;"></i>
                        <input type="text" id="messengerDirectorySearchEngine" placeholder="Search threads by participant names..." style="border:none; width:100%; outline:none; font-size:13.5px;">
                    </div>
                </div>
                <div id="messengerMainInterfaceMount">${renderChatInterface(chatData.activeThread || null, chatData.threads || [])}</div>
                `;

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
 * ASYNCHRONOUS FORM SUBMISSION INTERCEPTORS FOR TIMELINE
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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(Object.fromEntries(payload.entries()))
            });
            const result = await response.json();
            if (result.success) { alert("Archival submission registered."); router(); }
        } catch (err) { console.error(err); }
    });
}

window.logout = async function () {
    try {
        await fetch('api/auth/logout.php', { method: 'POST' });
        currentUserSession = null;
        window.location.hash = '#home';
    } catch (err) { window.location.reload(); }
};

window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', router);


// Inside app.js
window.loadActiveChatChannel = function(userId) {
    // Check if your central runtime memory array is called appState.chatThreads
    if (!appState || !appState.chatThreads) {
        console.error("Application state array streams have not initialized yet.");
        return;
    }

    // Match selected ID safely from global state pipeline
    const selectedThread = appState.chatThreads.find(thread => parseInt(thread.id) === parseInt(userId));
    
    if (selectedThread) {
        // Set the active window conversation instance object
        appState.activeThread = selectedThread;
        
        // Force routing update or trigger the wrapper interface refresh container immediately
        const workspaceTarget = document.getElementById('mainWorkspaceContentAnchor'); // Use your real DOM container ID here
        if (workspaceTarget) {
            // Re-render interface with updated state values
            workspaceTarget.innerHTML = renderChatInterface(appState.activeThread, appState.chatThreads);
            
            // If your layout requires form submissions or scroll targeting, reinitialize them here
            if (typeof initializeMessengerForms === 'function') {
                initializeMessengerForms();
            }
        }
    }
};

window.clearActiveChatChannel = function() {
    if (appState) {
        appState.activeThread = null;
    }
    const workspaceTarget = document.getElementById('mainWorkspaceContentAnchor');
    if (workspaceTarget) {
        workspaceTarget.innerHTML = renderChatInterface(null, appState.chatThreads);
    }
};