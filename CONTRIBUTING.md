# Contributing to agent-loop

Thank you for considering contributing to agent-loop! Please read this guide to understand our development workflow and how to contribute effectively.

## Development Workflow

### Branch Naming Convention
We use a structured branch naming system:
- `001-[feature-name]` - Platform foundation work
- `002-[feature-name]` - Authentication and RBAC systems
- `003-[feature-name]` - Property listings and management
- `004-[feature-name]` - CRM and contact management
- `005-[feature-name]` - Trust accounting and financial systems
- `006-[feature-name]` - Communication platform features
- `bugfix/[description]` - Bug fixes
- `hotfix/[description]` - Urgent production fixes

### Making Changes
1. Create a new branch from `main` following the naming convention above
2. Make your changes with clear, focused commits
3. Write meaningful commit messages following [Conventional Commits](https://www.conventionalcommits.org/)
4. Push your branch and open a Pull Request

### Pull Request Process
1. Ensure your code passes all tests and linting checks
2. Update documentation as needed
3. Request review from at least one team member
4. Address any feedback from reviewers
5. Once approved, merge using the "Squash and merge" option

### Code Standards
- Follow the existing code style in the repository
- Use TypeScript strictly - no `any` types without justification
- Add tests for new functionality
- Ensure accessibility compliance (WCAG 2.1 AA)
- Keep components small and focused
- Use Tailwind CSS utility classes consistently

### Deployment Process
All deployments to Vercel are handled automatically through GitHub Actions:
- Pushes to `main` branch trigger production deployments
- Pull requests trigger preview deployments
- Manual deployments should be avoided to prevent confusion

### Reporting Issues
When reporting issues, please include:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots or screen recordings when applicable
- Browser and device information

### Questions?
Reach out to the maintainers if you have any questions about the contribution process.
