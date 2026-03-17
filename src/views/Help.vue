<script setup lang="ts">
// Donation page — access via direct link only, no navigation
</script>

<template>
  <div class="donation-page">
    <div class="donation-page__content">
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

      <p class="donation-page__note">QR valid for one transaction</p>
    </div>
  </div>
</template>

<style scoped>
.donation-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 24px;
  background: linear-gradient(160deg, #0f0f0f 0%, #1a1a2e 50%, #0f0f0f 100%);
}

.donation-page__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  max-width: 520px;
  text-align: center;
}

.donation-page__title {
  font-size: clamp(1.75rem, 5vw, 2.25rem);
  font-weight: 700;
  color: #fff;
  margin: 0;
  letter-spacing: -0.02em;
}

.donation-page__subtitle {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.85);
  margin: 0;
}

.donation-page__message {
  display: flex;
  flex-direction: column;
  gap: 12px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.95rem;
  line-height: 1.65;
  margin: 8px 0;
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
}

.donation-page__qr-wrapper {
  padding: 16px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  margin: 8px 0;
}

.donation-page__image {
  display: block;
  width: 100%;
  max-width: 480px;
  height: auto;
  min-width: 280px;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.donation-page__note {
  color: rgba(255, 255, 255, 0.55);
  font-size: 13px;
  margin: 0;
}
</style>
