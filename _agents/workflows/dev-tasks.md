---
description: Build landing pages from the SEO dev task queue
---

This workflow processes pending tasks from the SEO Dev Agent's queue (`.github/dev-tasks/queue.json`).
It reads the design brief from the queue and automatically writes the React component, updates internal routing, applies SEO tags, tests the branch via `npm run build`, and commits the new landing page.

Follow these steps exactly to process the pending SEO tasks:

1. Use the `view_file` tool to read `.github/dev-tasks/queue.json`.
2. Find the first task where `status` is exactly `"pending"`. If no tasks are pending, tell the user the queue is empty.
3. Use the `view_file` tool to read `.github/knowledge_base/design_system.md` to refresh yourself on the FouriqTech design patterns (glassmorphism, Framer Motion, GSAP, etc.).
4. For the pending task, use the `write_to_file` tool to create the React component specified in `target_file`. 
   - Ensure you follow the `design_brief` and `content_brief` strictly to write high-converting copy.
   - You MUST include a standard `<Navbar />` and `<Footer />`.
   - You MUST include the `<SEO>` component with the provided `seo.meta_title` and `seo.meta_description`.
5. Use the `replace_file_content` tool to edit `src/App.tsx`. Define a route for the new page under `<Routes>`. Remember to add the `import` statement for the new page at the top.
6. Use the `replace_file_content` tool to edit `public/sitemap.xml`. Add a new `<url>` block with the new `route` mapping to `https://fouriqtech.com{route}`.
// turbo
7. Run `npm run build` using the `run_command` tool to verify your generated component has no type errors or syntax issues. Wait for this command to finish.
8. If the build fails, fix your code and re-build until it passes.
9. Use the `multi_replace_file_content` tool on `.github/dev-tasks/queue.json` to change the task's `status` to `"done"` and update the `completed_at` timestamp.
10. Tell the user the new landing page is built and ready for review! 
