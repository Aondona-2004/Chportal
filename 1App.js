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

// 2. LANDING PAGE COMPONENTS (Verify capitalization matches your folder names)
import { Header } from './components/Header.js';
import { Home } from './components/home.js';
import { About } from './components/about.js';
import { Explore } from './components/explore.js';
import { Footer } from './components/footer.js';

// Central Global Application Session Context
let currentUserSession = null;

/**
 * ASYNCHRONOUS AUTHENTICATION SUBMISSION HANDLERS
 */
function mountAuthFormInterceptors() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const loginErrorElement = document.getElementById('err');
    const signupErrorElement = document.getElementById('error-message');

    // --- LOGIN SUBMIT INTERCEPTOR ---
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (loginErrorElement) loginErrorElement.innerText = ''; // clear errors
            
            const formData = new FormData(loginForm);
            
            try {
                const response = await fetch('api/auth/login.php', {
                    method: 'POST',
                    body: formData // Sends identity and password to backend
                });
                const result = await response.json();
                
                if (result.success) {
                    // Update global state and route to dashboard feed
                    currentUserSession = result.user; 
                    window.location.hash = '#posts'; 
                } else {
                    if (loginErrorElement) loginErrorElement.innerText = result.message || "Invalid credentials.";
                }
            } catch (err) {
                console.error("Login communication breakdown:", err);
                if (loginErrorElement) loginErrorElement.innerText = "Network connection error.";
            }
        });
    }

    // --- SIGNUP SUBMIT INTERCEPTOR ---
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Collect matching fields manually or via FormData
            const payload = {
                firstname: document.getElementById('fname')?.value,
                surname: document.getElementById('sname')?.value,
                phone: document.getElementById('phoneNo')?.value,
                email: document.getElementById('email')?.value,
                tribe: document.getElementById('tribeSelect')?.value,
                tribe_specify: document.getElementById('tribeSpecify')?.value,
                password: document.getElementById('spassword')?.value,
                confirm_password: document.getElementById('cpassword')?.value,
            };

            if (payload.password !== payload.confirm_password) {
                alert("Passwords do not match!");
                return;
            }

            try {
                const response = await fetch('api/auth/register.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const result = await response.json();

                if (result.success) {
                    alert("Registration successful! Please log in.");
                    // Slide back to login screen view
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
    // Matched completely to your index.html target IDs
    const appRoot = document.getElementById('root-app-target');
    const portalHeaderMount = document.getElementById('header');
    const portalFooterMount = document.getElementById('footer');
    
    if (!appRoot) return;

    // Read Hash parameters cleanly. Fallback safely to #home for public viewports
    let currentHash = window.location.hash || '#home';
    
    // Check if the route belongs to a public landing page route layout
    const isPublicRoute = ['#home', '#about', '#explore'].includes(currentHash);

    // 3. Sync active user validation states on-the-fly
    if (!currentUserSession) {
        try {
            const sessionCheck = await fetch('api/auth/session.php');
            const sessionData = await sessionCheck.json();
            if (sessionData.success && sessionData.user) {
                currentUserSession = sessionData.user;
            } else {
                // If unauthenticated AND trying to access a private route, redirect
                if (!isPublicRoute) {
                    if (!window.location.pathname.includes('login.php')) {
                        window.location.href = 'login.php';
                    }
                    return;
                }
            }
        } catch (err) {
            console.error("Session verification pipeline trace failed:", err);
            if (!isPublicRoute) return;
        }
    }

    const isMobile = window.innerWidth <= 768;

    // 4. Handle Header Rendering
    if (portalHeaderMount) {
        if (currentUserSession && !isPublicRoute) {
            // Logged in application navbar metrics
            let notificationCount = 0;
            try {
                const badgeCheck = await fetch('api/notifications/badge.php');
                const badgeData = await badgeCheck.json();
                if (badgeData.success) notificationCount = badgeData.unread_count || 0;
            } catch (e) { console.warn(e); }
            
            portalHeaderMount.innerHTML = renderHeaderShell(currentUserSession, currentHash, notificationCount);
        } else {
            // Public Navbar Layout presentation mapping 
            portalHeaderMount.innerHTML = Header(currentUserSession, isMobile, currentHash);
        }
    }

    // 5. ACTIVE EXECUTION ROUTING SWITCH MATRIX
    try {
        // --- PUBLIC LANDING PAGES ROUTING ENGINE ---
        if (currentHash === '#home') {
            appRoot.innerHTML = Home();
            if (portalFooterMount) portalFooterMount.innerHTML = Footer(isMobile, 'index.html');
            
        } else if (currentHash === '#about') {
            appRoot.innerHTML = About();
            if (portalFooterMount) portalFooterMount.innerHTML = Footer(isMobile, 'about.html');
            
        } else if (currentHash === '#explore') {
            const loggedInState = currentUserSession ? true : false;
            appRoot.innerHTML = Explore(loggedInState);
            if (portalFooterMount) portalFooterMount.innerHTML = Footer(isMobile, 'explore.html');
            
            // If user is not logged in, attach layout click event triggers for forms safely
            if (!loggedInState) {
                attachAuthToggleListeners();
            }
            } else if (currentHash === '#explore') {
            const loggedInState = currentUserSession ? true : false;
            appRoot.innerHTML = Explore(loggedInState);
            if (portalFooterMount) portalFooterMount.innerHTML = Footer(isMobile, 'explore.html');
            
            // If user is not logged in, attach layout click event triggers and form endpoints safely
            if (!loggedInState) {
                attachAuthToggleListeners();
                mountAuthFormInterceptors(); // <--- ADD THIS CALL HERE
                // Note: Ensure your multi-step "Next Step" wizard script is also initialized here!
            }
        // --- PROTECTED DASHBOARD SYSTEM WORKSPACES ---
        } else if (currentHash === '#posts') {
            if (portalFooterMount) portalFooterMount.innerHTML = ''; // Hide public footer inside dashboard
            const response = await fetch('api/posts/feed.php');
            const data = await response.json();
            appRoot.innerHTML = UserTimelineView(data.feed || []);
            mountTimelineInterceptors();

        } else if (currentHash === '#profile') {
            if (portalFooterMount) portalFooterMount.innerHTML = '';
            appRoot.innerHTML = renderProfileSettingsWorkspace(currentUserSession);
            bindProfileUploadListeners();

        } else if (currentHash === '#management') {
            if (portalFooterMount) portalFooterMount.innerHTML = '';
            if (currentUserSession.role === 'admin') {
                const response = await fetch('api/posts/read_audit_queue.php');
                const data = await response.json();
                appRoot.innerHTML = AdminAuditorDashboard(data.queue || data.pendingPosts || []);
            } else if (currentUserSession.role === 'super_admin') {
                const usersCheck = await fetch('api/admin/read_users.php');
                const usersData = await usersCheck.json();
                const queueCheck = await fetch('api/posts/read_audit_queue.php');
                const queueData = await queueCheck.json();

                appRoot.innerHTML = SuperAdminConsole(usersData.users || [], queueData.queue || []);
            } else {
                appRoot.innerHTML = `<div class="forbidden-alert-container">Access Denied.</div>`;
            }

        } else if (currentHash === '#genealogy') {
            if (portalFooterMount) portalFooterMount.innerHTML = '';
            const response = await fetch('api/genealogy/tree_view.php');
            const data = await response.json();
            appRoot.innerHTML = renderGenealogyTree(data.tree || {});

        } else if (currentHash === '#notifications') {
            if (portalFooterMount) portalFooterMount.innerHTML = '';
            const response = await fetch('api/chat/directory.php');
            const data = await response.json();
            appRoot.innerHTML = renderChatInterface(data.activeThread || null, data.threads || []);

        } else {
            appRoot.innerHTML = `<div class="error-404-container"><h4>Workspace route "${currentHash}" not found.</h4></div>`;
        }
    } catch (routeError) {
        console.error("Routing execution lifecycle breakdown:", routeError);
        appRoot.innerHTML = `<div class="network-error-state">Communication failure updating workspace views.</div>`;
    }
    
}

/**
 * AUTH MODAL COMPONENT FORM SWAP TRIGGER REGISTER
 */
function attachAuthToggleListeners() {
    const authWrapper = document.getElementById('authWrapper');
    const showSignup = document.getElementById('showSignup');
    const showLogin = document.getElementById('showLogin');
    
    // Mobile Buttons Hooks mapping matching explore template classes
    const mobileShowSignup = document.querySelector('.showSignup1');
    const mobileShowLogin = document.querySelector('.showLogin1');

    if (!authWrapper) return;

    const activateSignup = () => authWrapper.classList.add('right-panel-active');
    const activateLogin = () => authWrapper.classList.remove('right-panel-active');

    if (showSignup) showSignup.addEventListener('click', activateSignup);
    if (showLogin) showLogin.addEventListener('click', activateLogin);
    if (mobileShowSignup) mobileShowSignup.addEventListener('click', activateSignup);
    if (mobileShowLogin) mobileShowLogin.addEventListener('click', activateLogin);
}

/**
 * ASYNCHRONOUS FORM SUBMISSION INTERCEPTORS
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

function bindProfileUploadListeners() {
    const profileForm = document.getElementById('profileSettingsUpdateForm');
    if (!profileForm) return;

    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('api/profile/update.php', { method: 'POST', body: new FormData(profileForm) });
            const result = await response.json();
            if (result.success) { alert("Profile updated."); router(); }
        } catch (err) { console.error(err); }
    });
}

window.logout = async function() {
    try {
        await fetch('api/auth/logout.php', { method: 'POST' });
        currentUserSession = null;
        window.location.hash = '#home'; // Safely kick out back to public home layout
    } catch (err) { window.location.reload(); }
};

window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', router);