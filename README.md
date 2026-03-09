# QR Generator & Reader

A modern [Next.js](https://nextjs.org) application for generating and reading QR codes directly in your browser.

## Features

- **Generate QR Code**: Convert any text into a QR code instantly.
- **Read QR Code**: 
  - **Camera**: Scan QR codes in real-time using your device's camera.
  - **Image Upload**: Upload a PNG, JPG, or JPEG file to extract the QR code content.
- **Responsive UI**: Built with Tailwind CSS for a clean and responsive experience on both desktop and mobile.

## Tech Specs

- **Framework**: [Next.js 16+](https://nextjs.org/) (App Router)
- **Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **APIs Used**:
  - [BarcodeDetector API](https://developer.mozilla.org/en-US/docs/Web/API/BarcodeDetector): For high-performance, native browser-based QR code scanning.
  - [QRServer API](https://goqr.me/api/): For generating QR codes from text.
- **Language**: TypeScript

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## 100 Days Challenge

This project is part of a [100 Days Challenge](https://github.com/prodromossarakinou/taverna-prodromes).

- **Current Progress**: 2/100 days
- **Days Spent Here**: 2 days

### Challenge Model

- **Duration**: 100 consecutive days
- **Rule**: Every day must produce measurable, documented progress.

**Valid daily progress includes:**
- Feature delivery
- Bug fixes
- Refactors with behavioral impact
- UI/UX improvements
- Build and dependency stabilization
- Architecture and infrastructure work
- Printing / device integrations
- Performance improvements
- Documentation and runbooks
- Sprint and progress records

*Progress must be commit-backed and logged.*
