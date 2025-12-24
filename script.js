document.addEventListener('DOMContentLoaded', function() {
    
    // --- 1. 滚动出现动画 ---
    // 监听带有 .animate-box 类的元素
    const animatedBoxes = document.querySelectorAll('.animate-box');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });
    
    animatedBoxes.forEach(box => observer.observe(box));

    // --- 2. 深色模式开关逻辑 ---
    const toggleCheckbox = document.getElementById('themeToggleCheckbox');
    const iconSpan = document.getElementById('themeIcon');
    const body = document.body;

    // 防止页面没有开关时报错
    if (!toggleCheckbox) return;

    // A. 初始化：检查本地缓存
    let savedTheme = 'light';
    try {
        savedTheme = localStorage.getItem('theme');
    } catch (e) { console.warn('LocalStorage 不可用'); }

    if (savedTheme === 'dark') {
        body.classList.add('dark-mode');
        toggleCheckbox.checked = true;
        if(iconSpan) iconSpan.textContent = '☀️';
    } else {
        body.classList.remove('dark-mode');
        toggleCheckbox.checked = false;
        if(iconSpan) iconSpan.textContent = '🌙';
    }

    // B. 监听开关切换
    toggleCheckbox.addEventListener('change', function() {
        if (this.checked) {
            // 开启深色模式
            body.classList.add('dark-mode');
            if(iconSpan) iconSpan.textContent = '☀️';
            try { localStorage.setItem('theme', 'dark'); } catch(e){}
        } else {
            // 关闭深色模式
            body.classList.remove('dark-mode');
            if(iconSpan) iconSpan.textContent = '🌙';
            try { localStorage.setItem('theme', 'light'); } catch(e){}
        }
    });
});