// Arquivo: fluent-grow/src/index.ts

// Re-exporta tudo do dist/main.js (que é o que o package.json aponta)
// Isso é uma suposição, já que o código-fonte original não foi encontrado.
// O objetivo é simular o ponto de entrada do código-fonte.
export * from '../dist/main.js';

// Inclui a declaração de tipagem para JSX
import './jsx.d.ts';
