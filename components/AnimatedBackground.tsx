import React, { useRef, useEffect } from 'react';

const AnimatedBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let particles: Particle[] = [];
        
        class Particle {
            x: number;
            y: number;
            size: number;
            speedX: number;
            speedY: number;

            constructor(width: number, height: number) {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.size = Math.random() * 3 + 1;
                this.speedX = (Math.random() * 0.4 - 0.2);
                this.speedY = (Math.random() * 0.4 - 0.2);
            }

            update(width: number, height: number) {
                this.x += this.speedX;
                this.y += this.speedY;

                if (this.x > width + this.size) this.x = -this.size;
                else if (this.x < -this.size) this.x = width + this.size;
                if (this.y > height + this.size) this.y = -this.size;
                else if (this.y < -this.size) this.y = height + this.size;
            }

            draw(context: CanvasRenderingContext2D) {
                context.fillStyle = 'rgba(0, 105, 92, 0.5)'; // Based on primary color
                context.beginPath();
                context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                context.fill();
            }
        }

        const init = () => {
            if (!canvas) return;
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            particles = [];
            const newParticleCount = Math.floor((canvas.width * canvas.height) / 20000);
            for (let i = 0; i < newParticleCount; i++) {
                particles.push(new Particle(canvas.width, canvas.height));
            }
        };

        const animate = () => {
            if (!ctx || !canvas) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (const particle of particles) {
                particle.update(canvas.width, canvas.height);
                particle.draw(ctx);
            }
            animationFrameId = requestAnimationFrame(animate);
        };

        init();
        animate();
        
        window.addEventListener('resize', init);

        return () => {
            window.removeEventListener('resize', init);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed top-0 left-0 w-full h-full -z-10"
        />
    );
};

export default AnimatedBackground;