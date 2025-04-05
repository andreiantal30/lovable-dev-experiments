export function enforceExecutionDiversity(executions: string[]): string[] {
  const formats = [
    { key: 'installation', match: /installation|immersive|popup|display/i },
    { key: 'event', match: /workshop|activation|live|flash mob/i },
    { key: 'parade', match: /parade|march|protest/i },
    { key: 'swap', match: /swap|exchange/i },
    { key: 'digital', match: /AR|virtual|online|filter|app/i },
    { key: 'public speech', match: /speech|monologue|storytelling/i },
  ];

  const capPerFormat = 2;
  const used: Record<string, number> = {};

  return executions.filter(ex => {
    for (const format of formats) {
      if (format.match.test(ex)) {
        const count = used[format.key] || 0;
        if (count >= capPerFormat) return false;
        used[format.key] = count + 1;
        return true;
      }
    }
    return true; // Keep if no match (counts as unique)
  });
}

export function reinforceExecutionDiversity(executions: string[]): string[] {
  const formats = {
    installation: /installation|immersive|popup|display/i,
    event: /workshop|activation|live|flash mob/i,
    protest: /parade|march|protest/i,
    swap: /swap|exchange/i,
    digital: /AR|virtual|online|filter|app/i,
    speech: /speech|monologue|storytelling/i,
  };

  const presentFormats = new Set<string>();
  for (const ex of executions) {
    for (const [key, regex] of Object.entries(formats)) {
      if (regex.test(ex)) presentFormats.add(key);
    }
  }

  const neededFormats = Object.keys(formats).filter(f => !presentFormats.has(f));
  const injectable: string[] = [];

  if (neededFormats.length > 0) {
    injectable.push(
      ...neededFormats.slice(0, 2).map(format =>
        `Surprise ${format} execution: A bold new expression using ${format} mechanics to subvert expectations and provoke public reaction.`
      )
    );
  }

  return [...executions, ...injectable];
}