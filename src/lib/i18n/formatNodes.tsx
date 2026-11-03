import React from 'react';

/** Like `fill`, but a placeholder may become an element (for example a name in bold); the text around it stays as it is. */
export function fillNodes(template: string, values: Record<string, React.ReactNode>): React.ReactNode[] {
  return template.split(/(\{\w+\})/g).map((part, index) => {
    const name = /^\{(\w+)\}$/.exec(part)?.[1];
    return name !== undefined && name in values ? <React.Fragment key={index}>{values[name]}</React.Fragment> : part;
  });
}
