// Animation and celebration effects

class AnimationController {
    constructor() {
        // 연속 완료 축하 메시지
        this.celebrationMessages = {
            1: {
                title: "🎉 좋아요!",
                message: "첫 번째 할 일 완료!"
            },
            2: {
                title: "🔥 훌륭해요!",
                message: "연속 2개 완료! 좋은 리듬이네요!"
            },
            3: {
                title: "⚡ 대단해요!",
                message: "연속 3개! 이 기세를 유지해봐요!"
            },
            4: {
                title: "🚀 환상적이에요!",
                message: "연속 4개 완료! 생산성 폭발!"
            },
            5: {
                title: "🌟 놀라워요!",
                message: "연속 5개! 진정한 실행력의 소유자!"
            },
            6: {
                title: "💎 경이로워요!",
                message: "연속 6개! 당신은 할 일 정복자!"
            },
            7: {
                title: "👑 전설이에요!",
                message: "연속 7개! 이런 집중력은 처음 봐요!"
            },
            8: {
                title: "🏆 절대강자!",
                message: "연속 8개 완료! 당신은 생산성의 신!"
            }
        };
    }

    // 변환 애니메이션 표시
    showTransformAnimation() {
        const animation = document.createElement('div');
        animation.className = 'transform-animation';
        animation.innerHTML = '✨';
        document.body.appendChild(animation);

        setTimeout(() => {
            if (animation.parentNode) {
                animation.remove();
            }
        }, 2000);
    }

    // 향상된 축하 메시지 표시
    showEnhancedCelebration(level) {
        // 기존 축하 메시지가 있으면 제거
        const existingCelebration = document.querySelector('.celebration');
        if (existingCelebration) {
            existingCelebration.remove();
        }

        // 기존 파티클이 있으면 제거
        const existingParticles = document.querySelector('.particles');
        if (existingParticles) {
            existingParticles.remove();
        }

        const message = this.celebrationMessages[level];
        if (!message) return;

        const celebration = document.createElement('div');
        celebration.className = `celebration level-${level}`;
        
        celebration.innerHTML = `
            <div class="streak-number">${level}</div>
            <h2>${message.title}</h2>
            <p>${message.message}</p>
        `;

        document.body.appendChild(celebration);

        // 레벨에 따른 파티클 이펙트
        if (level >= 3) {
            this.createParticleEffect(level);
        }

        // 축하 메시지 자동 제거
        setTimeout(() => {
            if (celebration.parentNode) {
                celebration.remove();
            }
        }, level >= 6 ? 2000 : 1000); // 높은 레벨일수록 더 오래 표시
    }

    // 파티클 이펙트 생성
    createParticleEffect(level) {
        const particles = document.createElement('div');
        particles.className = 'particles';
        document.body.appendChild(particles);

        const particleCount = Math.min(level * 12, 80);
        const colors = ['#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff'];

        // 파티클을 더 오래, 더 자주 생성
        for (let i = 0; i < particleCount; i++) {
            setTimeout(() => {
                this.createSingleParticle(particles, colors, level);
            }, i * (level >= 6 ? 30 : 60));
        }

        // 추가로 중간에 한 번 더 파티클 생성 (높은 레벨에서)
        if (level >= 5) {
            setTimeout(() => {
                for (let i = 0; i < particleCount / 2; i++) {
                    setTimeout(() => {
                        this.createSingleParticle(particles, colors, level);
                    }, i * 40);
                }
            }, 2000);
        }

        // 파티클 컨테이너 자동 제거
        setTimeout(() => {
            if (particles.parentNode) {
                particles.remove();
            }
        }, 10000);
    }

    // 개별 파티클 생성
    createSingleParticle(container, colors, level) {
        const particle = document.createElement('div');
        const colorIndex = Math.floor(Math.random() * colors.length);
        
        // 레벨에 따른 파티클 타입 결정
        let particleClass = 'particle';
        if (level >= 5 && Math.random() > 0.6) {
            particleClass += ' confetti';
        }
        if (level >= 7 && Math.random() > 0.7) {
            particleClass += ' star';
        }

        particle.className = particleClass;
        particle.style.background = colors[colorIndex];
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 0.5 + 's';
        
        // 높은 레벨에서는 더 다양한 크기
        if (level >= 6) {
            const size = Math.random() * 8 + 6;
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';
        }

        container.appendChild(particle);

        // 애니메이션 완료 후 제거
        setTimeout(() => {
            if (particle.parentNode) {
                particle.remove();
            }
        }, 8000);
    }
}

// Export animation controller globally
window.animationController = new AnimationController();