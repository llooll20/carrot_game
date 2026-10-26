# 

This document defines the mandatory rules for AI agents working on this project.

The rules in this document have priority over convenience, speed, or assumptions
made by the agent.

---

# 1. Project

This project is a browser-based economic simulation game.

Tech Stack:

- Phaser
- TypeScript
- Vite
- npm
- Git / GitHub

The game is developed as a single-player game first.

---

# 2. Core Principle

The agent must prioritize:

1. Correctness
2. Existing design
3. Clear responsibility
4. Minimal changes
5. Simplicity
6. Maintainability

Do not optimize for the amount of code produced.

Do not introduce complexity unless it is necessary.

Do not assume that more abstraction means better design.

---

# 3. Scope of Work

The agent must work only on the requested task.

Before modifying code:

1. Identify the requested feature or interaction.
2. Identify the classes and systems directly involved.
3. Inspect the existing implementation.
4. Determine the minimum required changes.

Do not modify unrelated code.

Do not perform opportunistic refactoring.

Do not rename, move, restructure, or rewrite unrelated classes.

If an unrelated problem is discovered:

- Do not fix it automatically.
- Report it separately.

---

# 4. Change Boundary

The agent must minimize the number of modified files.

When modifying a file that was not obviously related to the requested task:

1. Determine why the file must be changed.
2. Confirm that the change is necessary for the requested behavior.
3. Avoid modifying the file if the same result can be achieved without it.

Do not expand the scope of a task because a different implementation
appears cleaner.

Do not rewrite working code merely because another design is preferred.

---

# 5. Existing Code

Existing code is the primary source of truth for current implementation behavior.

Before creating a new class, method, or system:

- Search for existing implementations.
- Check whether the required functionality already exists.
- Reuse existing functionality when appropriate.

Do not create duplicate functionality.

Do not create a second implementation of an existing responsibility
without a clear reason.

---

# 6. Architecture

Separate responsibilities clearly.

Use the following general principles:

- Domain classes represent game entities and their state.
- Systems handle rules and processes involving multiple entities.
- Phaser scenes handle presentation, input, and scene transitions.
- UI code should not contain core game rules.
- Domain logic should not depend on Phaser-specific APIs unless necessary.

Do not place system-level logic inside entity classes merely for convenience.

Do not place unrelated responsibilities into a single class.

---

# 7. Class Design

A class should exist because it has a meaningful responsibility,
state, behavior, relationship, or lifecycle.

When designing a class, distinguish:

- Properties: state owned by the class.
- Methods: behavior performed by the class.
- Relationships: interactions with other objects.

Prefer:

- High cohesion
- Low coupling
- Clear responsibility
- Simple interfaces

Avoid:

- God classes
- Unnecessary inheritance
- Premature abstraction
- Duplicate state
- Duplicate responsibility

Do not introduce a parent class merely because two classes currently
share a few properties or methods.

Create abstractions when their common responsibility is sufficiently clear.

---

# 8. Inheritance

Prefer composition over inheritance unless inheritance clearly represents
a stable domain relationship.

Do not create inheritance hierarchies during implementation solely to
remove a small amount of duplicated code.

If two classes appear to share responsibilities:

1. Continue implementation using the simplest structure.
2. Observe the actual duplication.
3. Extract a shared abstraction only when the need is demonstrated.

---

# 9. Interaction-Driven Development

Major features should be implemented around individual game interactions.

Examples:

- Purchase
- Sale
- Production
- Processing
- Transportation
- Contract
- Loan
- Deposit
- Insurance
- Turn-end processing

For a significant interaction:

1. Identify participating classes.
2. Review the relevant sequence diagram or interaction specification.
3. Confirm class responsibilities.
4. Implement the interaction.
5. Test the interaction.
6. Refine the design if implementation reveals a structural problem.

Do not require every trivial method to have a sequence diagram.

---

# 10. Design Is Not Immutable

The existing design is a guide, not an immutable specification.

Implementation may reveal:

- Incorrect responsibility
- Excessive coupling
- Unnecessary classes
- Missing abstractions
- Duplicate responsibilities

When this happens:

- Do not silently perform a broad refactoring.
- Make the smallest correction necessary.
- If the change affects multiple systems or significantly changes architecture,
explain the reason before applying it.

Prefer incremental design improvement over speculative design.

---

# 11. Dependencies

Do not add a new dependency unless it is clearly necessary.

Before adding a dependency:

1. Check existing dependencies.
2. Check whether the feature can be implemented using the current stack.
3. Consider whether the dependency introduces unnecessary complexity.

Keep dependencies minimal.

Do not replace existing libraries without a clear reason.

---

# 12. AI-Assisted Development

AI-generated code must be treated as untrusted implementation output.

The agent must:

- Follow the existing architecture.
- Inspect related code before generating changes.
- Avoid generating unrelated code.
- Avoid inventing APIs or classes without checking the project.
- Keep implementation consistent with existing conventions.

The agent must not assume that generated code is correct merely because
it compiles.

The agent should verify:

- Type correctness
- Existing behavior
- Related interactions
- Build status
- Relevant tests

---

# 13. Context Control

Do not load or analyze the entire project when the requested task can be
completed with a smaller context.

For each task:

1. Read the relevant design document.
2. Inspect the directly related source files.
3. Inspect only additional dependencies required to understand the change.
4. Implement the smallest necessary change.

Do not unnecessarily analyze unrelated systems.

Do not reproduce large amounts of unrelated source code in responses.

---

# 14. Modification Safety

Never:

- Delete user code without permission.
- Discard user changes.
- Reset the repository.
- Force-push.
- Overwrite unrelated work.
- Modify unrelated files.
- Change public interfaces without necessity.

Preserve existing behavior unless the task explicitly requires changing it.

If a requested change would break an existing interface or system:

- Identify the conflict.
- Explain it.
- Make the smallest compatible change possible.

---

# 15. Refactoring

Do not refactor simply because code can be made "cleaner."

Refactoring is allowed when:

- It is required for the requested feature.
- Existing responsibility prevents correct implementation.
- Significant duplication is demonstrated.
- The current structure creates a concrete maintenance problem.

Do not combine feature implementation with unrelated cleanup.

Keep refactoring scope explicit.

---

# 16. Testing and Verification

After modifying code:

1. Run the relevant tests.
2. Run the project build.
3. Verify the requested behavior.
4. Check for unintended changes.

Do not consider a task complete merely because the code compiles.

If tests or build commands fail:

- Determine whether the failure was caused by the current change.
- Fix failures caused by the change.
- Do not silently modify unrelated systems to make the build pass.

---

# 17. Git

The agent must not create commits unless explicitly requested.

The agent must not push to a remote repository unless explicitly requested.

Never:

- Force-push
- Reset user changes
- Delete branches
- Rewrite history

Keep commits focused when commits are explicitly requested.

---

# 18. Communication

When completing a task, report briefly:

- What was changed.
- Which files were changed.
- What was tested.
- Whether any issues remain.

If the requested implementation requires a design decision that was not
defined by the existing specification:

- Do not silently invent a major rule.
- State the assumption.
- Prefer the smallest reasonable implementation.

If information is insufficient to safely implement the requested behavior,
ask for clarification rather than inventing a complex design.

---

# 19. Absolute Rules

The following rules must always be followed:

- Do not modify unrelated code.
- Do not perform opportunistic refactoring.
- Do not introduce unnecessary abstractions.
- Do not introduce unnecessary dependencies.
- Do not silently change established game rules.
- Do not assume generated code is correct.
- Do not discard user changes.
- Do not commit or push without explicit permission.
- Prefer the smallest change that correctly solves the requested problem.