// anim.js

const anim = {
    supports: typeof Element !== 'undefined' && !!Element.prototype.animate,

    run(el, keyframes, options = {}) {
        if (!el) return null;
        try {
            if (this.supports) return el.animate(keyframes, options);
        } catch (e) {}
        return null;
    },

    pop(el) {
        return this.run(
            el,
            [
                { transform: 'scale(0.96)', opacity: 0.85 },
                { transform: 'scale(1.03)', opacity: 1 },
                { transform: 'scale(1)', opacity: 1 }
            ],
            { duration: 260, easing: 'cubic-bezier(0.2, 1, 0.2, 1)' }
        );
    },

    pulseGlow(el) {
        return this.run(
            el,
            [
                { filter: 'drop-shadow(0 0 0 rgba(188, 19, 254, 0))' },
                { filter: 'drop-shadow(0 0 18px rgba(188, 19, 254, 0.55))' },
                { filter: 'drop-shadow(0 0 0 rgba(188, 19, 254, 0))' }
            ],
            { duration: 900, easing: 'ease-in-out' }
        );
    },

    shake(el) {
        return this.run(
            el,
            [
                { transform: 'translateX(0)' },
                { transform: 'translateX(-8px)' },
                { transform: 'translateX(8px)' },
                { transform: 'translateX(-5px)' },
                { transform: 'translateX(5px)' },
                { transform: 'translateX(0)' }
            ],
            { duration: 340, easing: 'ease-in-out' }
        );
    },

    sectionEnter(el) {
        return this.run(
            el,
            [
                { opacity: 0, transform: 'translateY(20px) scale(0.985)', filter: 'blur(8px)' },
                { opacity: 1, transform: 'translateY(0) scale(1)', filter: 'blur(0px)' }
            ],
            { duration: 380, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'both' }
        );
    },

    urgency(el) {
        return this.run(
            el,
            [
                { transform: 'scale(1)', filter: 'drop-shadow(0 0 0 rgba(255, 0, 85, 0))' },
                { transform: 'scale(1.08)', filter: 'drop-shadow(0 0 18px rgba(255, 0, 85, 0.6))' },
                { transform: 'scale(1)', filter: 'drop-shadow(0 0 0 rgba(255, 0, 85, 0))' }
            ],
            { duration: 650, easing: 'ease-in-out' }
        );
    },

    glitch(el) {
        if (!el) return;
        const txt = el.textContent || '';
        el.setAttribute('data-text', txt);
        el.classList.remove('glitch');
        void el.offsetWidth;
        el.classList.add('glitch');
        setTimeout(() => el.classList.remove('glitch'), 900);
    }
};
