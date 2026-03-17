<script setup lang="ts">
import { Moon, Sparkles, Heart } from "lucide-vue-next";

// Donation page — access via direct link only, no navigation
</script>

<template>
  <div class="donation-page">
    <div class="donation-page__bg" />
    <div class="donation-page__overlay" />

    <div class="donation-page__content">
      <div class="donation-page__icons">
        <Moon :size="28" class="donation-page__icon donation-page__icon--moon" />
        <Sparkles :size="24" class="donation-page__icon donation-page__icon--sparkle" />
        <Heart :size="22" class="donation-page__icon donation-page__icon--heart" />
      </div>

      <p class="donation-page__eid">Eid Mubarak</p>
      <h1 class="donation-page__title">Support Our Dream</h1>
      <p class="donation-page__subtitle">
        Your support means the world to us.
      </p>

      <div class="donation-page__message">
        <p>
          We're working to bring something meaningful — and this journey needs
          support from kind people like you. Any amount, no matter how small,
          helps a lot and we truly appreciate it.
        </p>
        <p>
          <strong>Thank you for choosing to give.</strong> May your kindness
          come back to you many times over.
        </p>
      </div>

      <p class="donation-page__cta">Scan the QR code below to donate:</p>

      <div class="donation-page__qr-wrapper">
        <img
          src="/crop-qris.jpeg"
          alt="QRIS BCA - Donation"
          class="donation-page__image"
          fetchpriority="high"
          loading="eager"
        />
      </div>

    </div>
  </div>
</template>

<style scoped>
.donation-page {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 24px;
  overflow: hidden;
}

.donation-page__bg {
  position: absolute;
  inset: 0;
  background: url("/eid2.jpg") center center / cover no-repeat;
}

.donation-page__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(15, 23, 42, 0.75) 0%,
    rgba(15, 23, 42, 0.85) 50%,
    rgba(15, 23, 42, 0.9) 100%
  );
}

.donation-page__content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  max-width: 520px;
  text-align: center;
}

.donation-page__icons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 4px;
}

.donation-page__icon {
  color: #fbbf24;
  opacity: 0.95;
  filter: drop-shadow(0 0 8px rgba(251, 191, 36, 0.4));
}

.donation-page__icon--moon {
  transform: rotate(-15deg);
}

.donation-page__icon--sparkle {
  color: #fde68a;
}

.donation-page__icon--heart {
  color: #fca5a5;
}

.donation-page__eid {
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: #fde68a;
  margin: 0;
}

.donation-page__title {
  font-size: clamp(1.75rem, 5vw, 2.25rem);
  font-weight: 700;
  color: #fff;
  margin: 0;
  letter-spacing: -0.02em;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.4);
}

.donation-page__subtitle {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
}

.donation-page__message {
  display: flex;
  flex-direction: column;
  gap: 12px;
  color: rgba(255, 255, 255, 0.88);
  font-size: 0.95rem;
  line-height: 1.65;
  margin: 8px 0;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.donation-page__message strong {
  color: #fbbf24;
  font-weight: 600;
}

.donation-page__cta {
  font-size: 1rem;
  font-weight: 600;
  color: #fbbf24;
  margin: 8px 0 0;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
}

.donation-page__qr-wrapper {
  padding: 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  margin: 8px 0;
  border: 1px solid rgba(251, 191, 36, 0.25);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35);
}

.donation-page__image {
  display: block;
  width: 100%;
  max-width: 500px;
  height: auto;
  min-width: 280px;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.donation-page__note {
  color: rgba(255, 255, 255, 0.65);
  font-size: 13px;
  margin: 0;
}
</style>
