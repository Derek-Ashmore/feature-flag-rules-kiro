# Project Structure

## Current Organization

```
feature-flag-rules-kiro/
├── .git/                 # Git version control
├── .kiro/               # Kiro IDE configuration
│   └── steering/        # AI assistant guidance documents
├── .vscode/             # VS Code settings
│   └── settings.json    # Kiro MCP configuration
├── LICENSE              # MIT License
└── README.md           # Project documentation
```

## Steering Documents
Located in `.kiro/steering/` - these guide AI assistant behavior:
- `product.md` - Product overview and development philosophy
- `tech.md` - Technology stack and development workflow
- `structure.md` - Project organization (this file)

## Development Conventions

### File Organization
- **Root level**: Core project files (README, LICENSE)
- **Configuration**: IDE and tooling configs in respective dot folders
- **Steering**: AI guidance documents in `.kiro/steering/`

### Future Structure Considerations
As the project grows, consider organizing by:
- `src/` - Source code implementation
- `specs/` - Feature specifications (following spec-driven approach)
- `tests/` - Test files
- `docs/` - Additional documentation

### Naming Conventions
- Use kebab-case for file and folder names
- Clear, descriptive names that indicate purpose
- Follow language-specific conventions once tech stack is chosen