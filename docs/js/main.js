// Initialize syntax highlighting
hljs.highlightAll();

// Theme Management System
const themeManager = {
    // DOM Elements
    elements: {
        html: document.documentElement,
        toggle: document.getElementById('theme-toggle'),
        menu: document.querySelector('.theme-menu'),
        lightIcon: document.querySelector('.theme-icon-light'),
        darkIcon: document.querySelector('.theme-icon-dark'),
        lightThemeHighlight: document.getElementById('light-theme-highlight'),
        darkThemeHighlight: document.getElementById('dark-theme-highlight')
    },

    // Get system theme preference
    getSystemTheme() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    },

    // Get stored theme preference
    getStoredTheme() {
        return {
            theme: localStorage.getItem('theme-preference'),
            mode: localStorage.getItem('theme-mode') // 'system' or 'manual'
        };
    },

    // Store theme preference
    storeTheme(theme, mode = 'manual') {
        localStorage.setItem('theme-preference', theme);
        localStorage.setItem('theme-mode', mode);
    },

    // Show theme change notification
    showToast(message) {
        // Remove existing toast if present
        const existingToast = document.querySelector('.theme-toast');
        if (existingToast) {
            existingToast.remove();
        }

        // Create new toast
        const toast = document.createElement('div');
        toast.className = 'theme-toast card shadow-sm';
        toast.innerHTML = `
            <div class="card-body p-3 d-flex align-items-center">
                <i class="bi bi-palette fs-5 me-2"></i>
                <span>${message}</span>
            </div>
        `;

        // Add toast to document
        document.body.appendChild(toast);

        // Trigger animation
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        // Remove toast after delay
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    },

    // Apply theme
    applyTheme(theme, mode = 'manual') {
        const { elements } = this;
        
        // Determine effective theme
        const effectiveTheme = mode === 'system' ? this.getSystemTheme() : theme;
        
        // Disable transitions on first load
        if (!elements.html.classList.contains('theme-loaded')) {
            elements.html.classList.add('no-transition');
            setTimeout(() => {
                elements.html.classList.remove('no-transition');
                elements.html.classList.add('theme-loaded');
            }, 0);
        }

        // Apply theme
        elements.html.setAttribute('data-bs-theme', effectiveTheme);
        
        // Update icons
        elements.lightIcon.classList.toggle('d-none', effectiveTheme === 'light');
        elements.darkIcon.classList.toggle('d-none', effectiveTheme === 'dark');
        
        // Update highlight.js theme
        elements.lightThemeHighlight.disabled = effectiveTheme === 'dark';
        elements.darkThemeHighlight.disabled = effectiveTheme === 'light';

        // Update menu UI
        document.querySelectorAll('.theme-option').forEach(option => {
            option.classList.toggle('active', option.dataset.theme === (mode === 'system' ? 'system' : effectiveTheme));
        });

        // Store preference
        this.storeTheme(theme, mode);

        // Show notification
        const themeName = mode === 'system' ? 'System' : (theme.charAt(0).toUpperCase() + theme.slice(1));
        this.showToast(`Theme changed to ${themeName}`);
    }
};

// Initialize theme
(() => {
    const { theme, mode } = themeManager.getStoredTheme();
    if (theme && mode) {
        themeManager.applyTheme(theme, mode);
    } else {
        themeManager.applyTheme(themeManager.getSystemTheme(), 'system');
    }
})();

// Theme change listeners
(() => {
    // System theme change detection
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
        if (themeManager.getStoredTheme().mode === 'system') {
            themeManager.applyTheme(event.matches ? 'dark' : 'light', 'system');
        }
    });

    // Theme menu toggle
    themeManager.elements.toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        themeManager.elements.menu.classList.toggle('d-none');
        themeManager.elements.toggle.setAttribute(
            'aria-expanded',
            themeManager.elements.toggle.getAttribute('aria-expanded') === 'true' ? 'false' : 'true'
        );
    });

    // Close theme menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!themeManager.elements.menu.contains(e.target) && 
            !themeManager.elements.toggle.contains(e.target)) {
            themeManager.elements.menu.classList.add('d-none');
            themeManager.elements.toggle.setAttribute('aria-expanded', 'false');
        }
    });

    // Theme option selection
    document.querySelectorAll('.theme-option').forEach(option => {
        option.addEventListener('click', () => {
            const theme = option.dataset.theme;
            if (theme === 'system') {
                themeManager.applyTheme(themeManager.getSystemTheme(), 'system');
            } else {
                themeManager.applyTheme(theme, 'manual');
            }
            themeManager.elements.menu.classList.add('d-none');
            themeManager.elements.toggle.setAttribute('aria-expanded', 'false');
        });
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !themeManager.elements.menu.classList.contains('d-none')) {
            themeManager.elements.menu.classList.add('d-none');
            themeManager.elements.toggle.setAttribute('aria-expanded', 'false');
        }
    });
})();

// Clipboard functionality
(() => {
    document.querySelectorAll('.copy-button').forEach(button => {
        button.addEventListener('click', async () => {
            const codeBlock = button.nextElementSibling.querySelector('code');
            const text = codeBlock.textContent;
            
            try {
                await navigator.clipboard.writeText(text);
                
                // Update button icon
                const icon = button.querySelector('i');
                icon.classList.replace('bi-clipboard', 'bi-check2');
                
                // Revert after delay
                setTimeout(() => {
                    icon.classList.replace('bi-check2', 'bi-clipboard');
                }, 2000);
            } catch (err) {
                console.error('Failed to copy text:', err);
                // Show error toast
                themeManager.showToast('Failed to copy to clipboard');
            }
        });
    });
})();

// Sidebar functionality
(() => {
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');

    // Toggle sidebar on mobile
    sidebarToggle?.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && 
            sidebar.classList.contains('active') && 
            !sidebar.contains(e.target) && 
            !sidebarToggle.contains(e.target)) {
            sidebar.classList.remove('active');
        }
    });

    // Handle navigation
    document.querySelectorAll('#sidebar .nav-link').forEach(link => {
        link.addEventListener('click', () => {
            // Remove active class from all links
            document.querySelectorAll('#sidebar .nav-link').forEach(l => 
                l.classList.remove('active')
            );
            
            // Add active class to clicked link
            link.classList.add('active');

            // Close sidebar on mobile after navigation
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('active');
            }
        });
    });
})();

// Scroll to hash on page load
(() => {
    if (window.location.hash) {
        const element = document.querySelector(window.location.hash);
        if (element) {
            element.scrollIntoView();
        }
    }
})();
