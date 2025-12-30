document.addEventListener('DOMContentLoaded', function() {
    console.log("脚本加载完毕，系统初始化...");

    // 状态标记
    let isJourneyStarted = false; // 标记旅程是否开始

    // ==========================================
    // 1. 基础功能 (动画、深色模式、位置记忆)
    // ==========================================
    
    const animatedBoxes = document.querySelectorAll('.animate-box');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('visible');
        });
    }, { threshold: 0.1 });
    animatedBoxes.forEach(box => observer.observe(box));

    // 深色模式逻辑
    const toggleCheckbox = document.getElementById('themeToggleCheckbox');
    const iconSpan = document.getElementById('themeIcon');
    const body = document.body;

    function applyTheme(theme) {
        if (theme === 'dark') {
            body.classList.add('dark-mode');
            if (toggleCheckbox) toggleCheckbox.checked = true;
            if (iconSpan) iconSpan.textContent = '☀️';
        } else {
            body.classList.remove('dark-mode');
            if (toggleCheckbox) toggleCheckbox.checked = false;
            if (iconSpan) iconSpan.textContent = '🌙';
        }
        localStorage.setItem('theme', theme);
    }
    let savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);

    if (toggleCheckbox) {
        toggleCheckbox.addEventListener('change', function() {
            applyTheme(this.checked ? 'dark' : 'light');
        });
    }

    // 页面位置记忆
    if (window.location.pathname.includes('projects.html')) {
        const savedScrollY = sessionStorage.getItem('projectsScrollY');
        if (savedScrollY) {
            setTimeout(() => window.scrollTo({ top: parseInt(savedScrollY), behavior: 'instant' }), 10);
            sessionStorage.removeItem('projectsScrollY');
        }
    }
    window.saveScrollAndGo = function(url) {
        sessionStorage.setItem('projectsScrollY', window.scrollY);
        window.location.href = url;
    };


    // ==========================================
    // 2. 几何小人核心逻辑 (修复版：防抢跑)
    // ==========================================
    const geoMan = document.getElementById('geo-man');
    const learnMoreBtn = document.querySelector('.scroll-btn');
    const aboutSection = document.getElementById('about-me');

    // --- A. 眼球跟随 ---
    document.addEventListener('mousemove', function(e) {
        // 只有小人激活且显示时才计算
        if (!geoMan || !geoMan.classList.contains('active')) return;

        const eyes = document.querySelectorAll('.man-eye');
        eyes.forEach(eye => {
            const pupil = eye.querySelector('.pupil');
            if (!pupil) return;
            
            const eyeRect = eye.getBoundingClientRect();
            const eyeCenterX = eyeRect.left + eyeRect.width / 2;
            const eyeCenterY = eyeRect.top + eyeRect.height / 2;

            const angle = Math.atan2(e.clientY - eyeCenterY, e.clientX - eyeCenterX);
            const distance = 15; 
            const moveX = Math.cos(angle) * distance;
            const moveY = Math.sin(angle) * distance;

            pupil.style.transform = `translate(calc(-50% + ${moveX}px), calc(-50% + ${moveY}px))`;
        });
    });

    // --- B. 激活函数 ---
    function activateGeoMan() {
        // ★ 核心修复：如果旅程还没开始，严禁小人出现
        if (!isJourneyStarted) {
            console.log("拦截：旅程未开始，小人保持隐藏");
            return;
        }

        if (!geoMan) return;
        if (geoMan.classList.contains('active')) return; 
        
        console.log(">>> 条件满足，小人登场！");
        geoMan.style.display = 'block'; 
        // 延迟一丢丢，确保 display:block 生效后再加动画类
        setTimeout(() => {
            geoMan.classList.add('active');
        }, 100);
    }

    // --- C. 初始化监听器 (但在 startJourney 后才真正生效) ---
    
    // 1. 按钮点击监听
    if (learnMoreBtn) {
        learnMoreBtn.addEventListener('click', function() {
            // 点击按钮肯定是旅程开始了，延迟 300ms 等滚动
            if (isJourneyStarted) setTimeout(activateGeoMan, 300);
        });
    }

    // 2. 滚动监听 (IntersectionObserver)
    // 我们把这个逻辑封装成一个函数，只有等开幕结束后才调用它
    function startObservingScroll() {
        if (aboutSection) {
            const manObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        // 只有当 about-me 确实进入视野才触发
                        activateGeoMan();
                        // 触发一次后就销毁，保持悬浮
                        if (isJourneyStarted && geoMan.classList.contains('active')) {
                            manObserver.disconnect();
                        }
                    }
                });
            }, { threshold: 0.1 }); // 门槛设为 0.1，必须露头 10%
            manObserver.observe(aboutSection);
        }
    }


    // ==========================================
    // 3. 开幕转场 (一切的起点)
    // ==========================================
    
    const curtain = document.getElementById('intro-curtain');
    const audio = document.querySelector('.music-player');
    
    if (curtain) {
        // 初始化：锁滚动，回顶
        if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
        window.scrollTo(0, 0);
        document.body.style.overflow = 'hidden'; 
        
        // 确保小人一开始是隐藏的
        if (geoMan) geoMan.style.display = 'none';

        window.startJourney = function() {
            if (isJourneyStarted) return;
            isJourneyStarted = true; // ★ 标记旅程开始

            // 1. 深色模式
            applyTheme('dark');

            // 2. 动画与解锁
            curtain.classList.add('slide-up');
            document.body.style.overflow = ''; 
            document.body.style.overflowY = 'auto';

            // ★ 关键修改：此时才把小人设为 block (但仍在屏幕下方)
            // 这样是为了让浏览器准备渲染它，但它不会立刻浮上来，要等 activateGeoMan
            if (geoMan) geoMan.style.display = 'block';

            // ★ 关键修改：此时才开始启动“哨兵”去监测滚动
            startObservingScroll();

            setTimeout(() => { curtain.style.display = 'none'; }, 1200);

            // 3. 播放
            if (audio) audio.play().catch(e => console.log("需交互播放"));
        };

        curtain.addEventListener('click', startJourney); 
        window.addEventListener('wheel', function(e) {
            if (!isJourneyStarted && Math.abs(e.deltaY) > 0) window.startJourney();
        }, { passive: true });
        window.addEventListener('touchstart', function(e) {
            if (!isJourneyStarted) window.startJourney();
        }, { passive: true });
        window.addEventListener('keydown', function(e) {
            if (!isJourneyStarted && (e.code === 'Space' || e.code === 'Enter')) window.startJourney();
        });
    } else {
        // 如果没有开幕页（非主页），直接设为 true 并启动监听
        isJourneyStarted = true;
        document.body.style.overflow = 'auto';
        if (geoMan) geoMan.style.display = 'block';
        startObservingScroll();
    }
});
    // ==========================================
    // 4. 伪 3D 视差交互 (Parallax Effect)
    // ==========================================
    
    // 获取图层元素
    const layerBody = document.getElementById('layer-body');
    const layerHead = document.getElementById('layer-head');
    const layerEyes = document.getElementById('layer-eyes');
    const layerArms = document.getElementById('layer-arms');
    const manContainer = document.getElementById('geo-man');

    if (manContainer) {
        // --- A. 鼠标跟随视差 ---
        // --- A. 鼠标跟随视差 (终极版：瞳孔独立追踪) ---
        // 获取所有瞳孔元素
        const pupils = document.querySelectorAll('.real-pupil');

        document.addEventListener('mousemove', (e) => {
            if (!manContainer.classList.contains('active')) return;

            // 1. 设定锚点 (屏幕左侧 20%, 高度 60% 处为小人位置)
            const neutralX = window.innerWidth * 0.2; 
            const neutralY = window.innerHeight * 0.6;

            // 2. 计算鼠标距离 (归一化)
            // 减小分母，让反应更灵敏
            let x = (e.clientX - neutralX) / (window.innerWidth * 1.2);
            let y = (e.clientY - neutralY) / (window.innerHeight * 1.2);

            // 3. 限制转动角度 (Clamp)
            // 向左转受限(-0.2)，向右看内容放开(0.8)
            x = Math.max(-0.25, Math.min(0.8, x)); 
            y = Math.max(-0.25, Math.min(0.3, y));

            // 4. 应用图层视差 (身体/头/四肢)
            if(layerBody) layerBody.style.transform = `translate(${x * 5}px, ${y * 2}px)`;
            if(layerHead) layerHead.style.transform = `translate(${x * 15}px, ${y * 8}px)`;
            if(layerArms) layerArms.style.transform = `translate(${x * 10}px, ${y * 5}px)`;
            
            // 5. 眼睛整体层 (眼眶) 稍微动一点
            if(layerEyes) layerEyes.style.transform = `translate(${x * 20}px, ${y * 10}px)`;

            // =================================================
            // ★ 核心升级：瞳孔独立追踪 (Eye Tracking)
            // =================================================
            // 让瞳孔在眼眶里额外移动，产生“注视”效果
            pupils.forEach(pupil => {
                // 计算瞳孔位移：范围限制在 +/- 7px 内，防止移出眼白
                // x * 12 表示眼珠转动的幅度
                const pupilX = x * 12; 
                const pupilY = y * 8;
                
                // 应用位移 (注意保留原有的 cx=4, cy=4 布局)
                // 这里直接用 CSS transform 覆盖
                pupil.style.transform = `translate(${pupilX}px, ${pupilY}px)`;
                // 确保平滑移动，不要太抖
                pupil.style.transition = 'transform 0.05s linear'; 
            });
        });


        // --- B. 点击切换视角 (Click to Flip) ---
        let isFlipped = false;
        
        manContainer.addEventListener('click', () => {
            isFlipped = !isFlipped;
            
            // 这里我们用 CSS 变量或者直接修改样式来实现“侧身”效果
            const svgElement = manContainer.querySelector('.man-svg');
            
            if (isFlipped) {
                // 变成“侧面视角”：整体旋转，并且稍微倾斜
                svgElement.style.transition = "transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)";
                svgElement.style.transform = "rotateY(180deg) rotateZ(5deg)"; 
                // 注意：rotateY(180deg) 实际上是镜像翻转，看起来像背过身或转过去
                // 如果只想侧身一点点，可以用 rotateY(45deg)
            } else {
                // 回到正面
                svgElement.style.transform = "rotateY(0deg) rotateZ(0deg)";
            }
        });
        
        // 鼠标移出时自动归位 (可选)
        
        document.addEventListener('mouseleave', () => {
             [layerBody, layerHead, layerEyes, layerArms].forEach(el => {
                 if(el) el.style.transform = 'translate(0,0)';
             });
        });
        
    }
    // ==========================================
    // 5. 随机行为系统 (修复版)
    // ==========================================
    
    const leftArm = document.getElementById('left-arm');
    const cupGroup = document.getElementById('cup-group');
    const rightArm = document.getElementById('right-arm');

    function randomRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    // --- 行为 A: 喝咖啡 ---
    function scheduleDrink() {
        const delay = randomRange(5000, 12000); // 等待 5-12秒
        
        setTimeout(() => {
            if(!leftArm || !cupGroup) return;
            
            // 开始动画
            leftArm.classList.add('action-drink');
            cupGroup.classList.add('action-drink-cup');
            
            // 4秒后结束动画
            setTimeout(() => {
                leftArm.classList.remove('action-drink');
                cupGroup.classList.remove('action-drink-cup');
                
                // 预约下一次
                scheduleDrink();
            }, 4000); // 必须与 CSS 动画时间一致
            
        }, delay);
    }

    // --- 行为 B: 挠头 ---
    function scheduleScratch() {
        const delay = randomRange(8000, 20000); // 等待 8-20秒
        
        setTimeout(() => {
            if(!rightArm) return;
            
            // 开始动画
            rightArm.classList.add('action-scratch');
            
            // 2.5秒后结束动画
            setTimeout(() => {
                rightArm.classList.remove('action-scratch');
                
                // 预约下一次
                scheduleScratch();
            }, 2500); // 必须与 CSS 动画时间一致
            
        }, delay);
    }

    // 启动
    if (leftArm && rightArm) {
        scheduleDrink();
        scheduleScratch();
    }