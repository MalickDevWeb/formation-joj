/**
 * Les agents de `.claude/agents/` : chacun est bien défini, l'équipe ux-design → backend → frontend
 * a des périmètres qui ne se chevauchent pas, et chaque agent garde les garde-fous de la méthode.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const DIR = join(import.meta.dirname, '..', 'agents');
const KNOWN_TOOLS = new Set(['Read', 'Grep', 'Glob', 'Bash', 'Edit', 'Write']);

interface Agent {
  file: string;
  name: string;
  description: string;
  tools: string[];
  body: string;
}

/** Lit l'en-tête `--- … ---` d'un agent : name, description, tools. */
function readAgent(file: string): Agent {
  const text = readFileSync(join(DIR, file), 'utf8');
  const match = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(text);
  if (!match) throw new Error(`${file} : en-tête --- absent`);
  const field = (key: string) =>
    new RegExp(`^${key}: (.*)$`, 'm').exec(match[1] ?? '')?.[1]?.trim() ?? '';
  return {
    file,
    name: field('name'),
    description: field('description'),
    tools: field('tools')
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean),
    body: match[2] ?? '',
  };
}

// Un fichier sans en-tête est une référence lue par un agent (la grille du relecteur), pas un agent.
const agents = readdirSync(DIR)
  .filter((f) => f.endsWith('.md') && readFileSync(join(DIR, f), 'utf8').startsWith('---\n'))
  .map(readAgent);
const byName = (name: string) => {
  const agent = agents.find((a) => a.name === name);
  if (!agent) throw new Error(`agent ${name} introuvable`);
  return agent;
};

describe('agents', () => {
  it.each(agents.map((a) => [a.file, a] as const))(
    '%s has a name matching its file, a description and known tools',
    (file, agent) => {
      expect(agent.name).toBe(file.replace(/\.md$/, ''));
      expect(agent.description.length).toBeGreaterThan(40);
      expect(agent.tools.length).toBeGreaterThan(0);
      for (const tool of agent.tools) expect(KNOWN_TOOLS).toContain(tool);
    },
  );

  it('the team ux-design, backend and frontend exists, with the reviewer that validates it', () => {
    for (const name of ['ux-design', 'backend', 'frontend', 'relecteur'])
      expect(byName(name)).toBeDefined();
  });

  it('the reviewer only reads: it cannot edit or write files', () => {
    expect(byName('relecteur').tools).not.toContain('Edit');
    expect(byName('relecteur').tools).not.toContain('Write');
  });

  it('each team agent owns its own folder, and forbids the folders of the others', () => {
    const scopes = { 'ux-design': 'design/', backend: 'apps/api/', frontend: 'apps/web/' } as const;
    for (const [name, scope] of Object.entries(scopes)) {
      const { body } = byName(name);
      expect(body, `${name} doit nommer son périmètre`).toContain(`\`${scope}\``);
    }
    expect(byName('backend').body).toMatch(/ne modifies ni[^\n]*`apps\/web\/`/);
    expect(byName('frontend').body).toMatch(/ne modifies ni[^\n]*`apps\/api\/`/);
    expect(byName('ux-design').body).toMatch(/n'écris que dans `design\/`/);
  });

  it.each(['backend', 'frontend'])(
    '%s writes the test first and never bypasses the commit hook',
    (name) => {
      const { body } = byName(name);
      expect(body).toContain('pnpm tdd:red');
      expect(body).toContain('rouge pour la bonne raison');
      expect(body).toMatch(/Jamais `--no-verify`/);
      expect(body).toContain('plan.md');
    },
  );

  it.each(['ux-design', 'backend', 'frontend'])(
    '%s never pushes, never changes the spec and never validates its own work',
    (name) => {
      const { body } = byName(name);
      expect(body).toMatch(/ne pousses rien|ne commites rien et ne pousses rien/);
      expect(body).toMatch(/ne (modifies|changes) (ni `spec\.md`|pas la spec)/);
    },
  );

  it.each(['backend', 'frontend'])(
    '%s validates its own work only through the reviewer',
    (name) => {
      expect(byName(name).body).toMatch(/ne valides pas ton propre travail[^.]*`?relecteur`?/);
    },
  );

  it('the backend keeps the Claude API key out of the code and the tests away from Claude', () => {
    const { body } = byName('backend');
    expect(body).toContain('ANTHROPIC_API_KEY');
    expect(body).toContain('jamais du code');
    expect(body).toContain("Les tests n'appellent jamais Claude");
  });
});
