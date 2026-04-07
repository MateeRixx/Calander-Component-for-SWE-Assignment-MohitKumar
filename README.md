# 🗓️ Interactive Wall Calendar

Hey there! 👋 This is my submission for the Frontend Engineering Challenge. 

I set out to build a beautiful, interactive calendar component that actually feels like a physical wall calendar you'd hang up in your office or room. It has a clean layout, is easy to use, and includes some fun extra features! 

## 🌟 What I Built

Here are the main features of the calendar:

*   **Physical Calendar Feel:** I designed it with a large "hero" image covering the left side that changes every month. I even added a subtle paper texture and small "binder rings" at the top to give it that authentic, real-world wall calendar aesthetic.
*   **Day & Range Selection:** You can pick a specific date or select a start and end date for a multi-day range. Single-day selections highlight with a blue circular badge, while range boundaries (start and end) highlight in red to keep things visually distinct and easy to read.
*   **Integrated Sticky Notes:** There's a handy side panel for notes! You can write memos and attach them to a single day, a range of days (like a vacation), or just save a general thought for the month. **Important:** Your notes are automatically saved directly in your browser (`localStorage`), so they won't disappear if you refresh the page!
*   **Mobile Friendly:** Try pulling it up on your phone! The component handles different screen sizes beautifully. On a desktop, it sits elegantly side-by-side. On mobile screens, the image and calendar naturally stack on top of the notes section without breaking.

## ✨ A Little Extra Magic (Creative Liberty)
I wanted to go slightly above and beyond the baseline requirements, so I added:
1.  **3D Page Flipping:** When you navigate between months, the calendar performs a smooth 3D page-flip animation, just like turning the page of a real calendar.
2.  **Smart Auto-Tagging:** When you type a memo, the app reads your text. If it sees words like "meet" or "call", it tags it as a `SCHEDULE`. Words like "deadline" or "remember" get tagged as a `REMINDER`, and general thoughts get tagged as a `REFLECTION`.

## 🛠️ Built With

I wanted to keep the codebase clean and avoid over-engineering. I focused strictly on frontend code:
*   **React & Next.js:** For the core component logic and layout.
*   **Framer Motion:** To create the buttery-smooth flipping animations.
*   **Date-fns:** To do all the heavy lifting for date math (figuring out leap years, days in a month, etc.) without writing messy custom logic.
*   **Vanilla CSS Modules:** No heavy CSS frameworks were used for the component styling! Just plain, scoped CSS to keep things lightweight.

## 🚀 How to Run It Locally

If you'd like to test this out on your own machine, it's super easy:

1. Clone this repository to your computer.
2. Open your terminal and navigate to the project folder (`calendar-app`).
3. Run `npm install` to download the packages.
4. Run `npm run dev` to start the development server.
5. Open your browser and go to `http://localhost:3000`.

Enjoy the calendar will be waiting for you! 

Thanks for taking the time to review my project. I had a lot of fun building it! 
