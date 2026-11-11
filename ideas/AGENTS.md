# Idea navigator maintenance

The public navigator is https://sunayjoshi.github.io/ideas/.

## Visibility preferences

Before every navigator update, retrieve the owner's saved hide/show preferences from the private Sunay Storage visibility Site. These records are authoritative; do not infer choices from browser storage or a stale local export.

- Site project ID: `appgprj_6af4e11b274c81918e39c412668992fa`
- Owner editor: https://sunay-idea-visibility.sunay-joshi1.chatgpt.site/
- The Site stores structured preferences in D1. Discover the current binding and table with the Sites `read_database_overview` tool, then read all pages of `idea_visibility` with `read_database_table_rows`.
- `hidden = 1` means hide the idea on the next navigator update. `hidden = 0` means keep it visible or restore it if previously hidden. An absent record means no visibility override.
- Apply hidden IDs consistently to the published idea data, search index, hierarchy/bubble leaves, list, Pareto view, and related links. Rebuild derived data; check that no hidden ideas reappear through search or direct links.
- Preserve the canonical source content and the saved preferences. Hiding a web idea does not authorize deleting its Overleaf source. Restore a previously hidden idea from the canonical source when its preference changes back to visible.
- Refresh the private editor's catalog of IDs and titles when ideas are added or renamed. Retain entries for previously hidden IDs so the owner can reverse those decisions.
- If the preference backend cannot be read, report that limitation and preserve the last applied visibility state. Do not silently restore hidden content.

The popup's **Hide / show** link opens this private editor. Choices are saved in the backend immediately; the public navigator changes on the next site update.
