<script lang="ts">
    import { onMount } from 'svelte';

    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D | null;
    let width: number;
    let height: number;
    let animationFrameId: number;

    interface Snowflake {
        x: number;
        y: number;
        radius: number;
        speed: number;
        wind: number;
        opacity: number;
    }

    let snowflakes: Snowflake[] = [];
    const SNOWFLAKE_COUNT = 100;

    function createSnowflake(): Snowflake {
        return {
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 3 + 1,
            speed: Math.random() * 1 + 0.5,
            wind: Math.random() * 0.5 - 0.25,
            opacity: Math.random() * 0.5 + 0.3
        };
    }

    function initSnow() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
        
        snowflakes = [];
        for (let i = 0; i < SNOWFLAKE_COUNT; i++) {
            snowflakes.push(createSnowflake());
        }
    }

    function update() {
        if (!ctx) return;
        ctx.clearRect(0, 0, width, height);

        for (let flake of snowflakes) {
            flake.y += flake.speed;
            flake.x += flake.wind;

            // Reset if out of bounds
            if (flake.y > height) {
                flake.y = -5;
                flake.x = Math.random() * width;
            }
            if (flake.x > width) {
                flake.x = 0;
            } else if (flake.x < 0) {
                flake.x = width;
            }

            ctx.beginPath();
            ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${flake.opacity})`;
            ctx.fill();
        }

        animationFrameId = requestAnimationFrame(update);
    }

    onMount(() => {
        ctx = canvas.getContext('2d');
        initSnow();
        update();

        const handleResize = () => {
            initSnow();
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    });
</script>

<canvas bind:this={canvas} class="snow-canvas"></canvas>

<style>
    .snow-canvas {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 0; /* Behind everything */
    }
</style>
