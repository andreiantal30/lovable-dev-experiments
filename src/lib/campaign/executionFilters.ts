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