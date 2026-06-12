# Y-Balance Test (YBT-LQ)

Aplicação web fullstack para avaliação clínica do **Y-Balance Test — Lower Quarter (YBT-LQ)**: coleta de alcances, cálculo automático de médias, normalização pelo comprimento do membro, escore composto, análise de assimetria, interpretação clínica automatizada, laudo editável, exportação para Excel e persistência no servidor.

## Stack

- **Next.js 14** (App Router) — frontend + API Routes
- **Tailwind CSS 3** — estilização mobile-first
- **Lucide React** — ícones
- **xlsx (SheetJS)** — exportação de planilhas `.xlsx`

## Funcionalidades

1. **Login simples** (credenciais internas hardcoded em `src/components/LoginScreen.jsx`)
2. **Identificação do paciente** — nome, data, idade, avaliador
3. **Comprimento dos membros** (cm) — obrigatório para normalização
4. **Coleta de dados** — 2 apoios × 3 direções (ANT, PM, PL) × 3 tentativas, com média em tempo real (ignora campos vazios)
5. **Resultados calculados**
   - Normalização por direção: `(média ÷ comprimento do membro do mesmo lado) × 100`
   - Escore composto: `(ANT + PM + PL) ÷ (3 × comprimento do membro) × 100`
   - Assimetria: `|média esquerda − média direita|` — alerta vermelho quando > 4,0 cm
6. **Interpretação clínica automática**
   - Escore composto < 94% em qualquer perna → alerta de risco global aumentado
   - Assimetria > 4 cm → alerta de risco de lesões articulares/sobrecarga
   - Laudo gerado automaticamente e editável (com restauração do texto automático)
7. **Exportação e armazenamento**
   - **Baixar Excel** — gera `.xlsx` com dados brutos, médias, cálculos e laudo
   - **Salvar Dados no Servidor** — `POST /api/save-evaluation` adiciona o registro a `data/database.json` (via `fs/promises`)
8. **Nova Avaliação** — reseta o formulário mantendo a sessão

Valores não calculáveis (campos vazios, divisão por zero) são exibidos como `---`. Todos os resultados usam 1 casa decimal. Os inputs aceitam vírgula ou ponto como separador decimal.

## Interpretação estratificada por população

Além do dashboard genérico (limiar de 94% e assimetria de 4 cm), o app aplica uma camada de leitura clínica ajustada ao **perfil do avaliado**, selecionável em "Perfil Clínico e Contexto":

| Perfil | Escore composto (adequado) | LSI (liberação) | Assimetria anterior (baixo risco) |
| --- | --- | --- | --- |
| Sedentário / baixa atividade | ≥ 85% | ≥ 90% | ≤ 4 cm |
| Atleta recreacional / amador | ≥ 90% (ótimo ≥ 95%) | ≥ 90% (ótimo ≥ 94%) | ≤ 4 cm |
| Atleta competitivo / elite | ≥ 100% (ótimo ≥ 106%) | ≥ 94% | ≤ 3 cm |
| Adolescente (10–17 anos) | comparar ao percentil 50 (idade/sexo) | ≥ 90% | ≤ 4 cm (alta prevalência, cautela) |

- **LSI (Limb Symmetry Index)** = `(membro lesionado ÷ contralateral) × 100`, usando os escores compostos. O avaliador indica o **membro lesionado** (Esquerdo/Direito); em modo **Triagem/preventivo** o LSI é calculado como `menor escore ÷ maior escore`.
- **Direções posteriores (PM/PL)** recebem classificação normalizada própria (perfis recreacional e competitivo), por serem melhores preditoras de instabilidade crônica.
- **Critérios objetivos de retorno ao esporte** combinam escore composto, LSI e assimetria anterior em três níveis (liberação / progressão parcial / manter restrições), com a ressalva de que dor e confiança subjetiva não são capturadas pelo instrumento.

O perfil, o LSI e as classificações entram automaticamente no **laudo editável**, na **exportação Excel** e no **payload salvo no servidor**.

## Desenvolvimento local

```bash
npm install
npm run dev
```

Acesse http://localhost:3000.

## Build de produção

```bash
npm run build
npm start
```

## Deploy na Hostinger

A rota de API grava em disco (`data/database.json`), portanto o app precisa rodar como **aplicação Node.js** (não como site estático):

- **VPS**: instale Node 18+, clone o repositório, `npm install && npm run build` e mantenha o processo com PM2 (`pm2 start npm --name ybt -- start`). Use o Nginx/proxy reverso da Hostinger apontando para a porta 3000 (ou defina `PORT`).
- **Hospedagem com suporte a Node.js (hPanel)**: configure o app apontando para `npm start` após o build, garantindo permissão de escrita na pasta `data/`.

> ⚠️ O arquivo `data/database.json` contém dados de pacientes e está no `.gitignore` — faça backup dele separadamente e não o versione.

## Estrutura

```
src/
├── app/
│   ├── api/save-evaluation/route.js   # POST: persiste avaliações em data/database.json
│   ├── globals.css
│   ├── layout.js
│   └── page.js                        # Orquestra estado e seções da avaliação
├── components/
│   ├── ActionsBar.jsx                 # Excel / Salvar / Nova Avaliação
│   ├── AppHeader.jsx
│   ├── CollectionBlock.jsx            # Bloco de coleta por apoio
│   ├── InterpretationCard.jsx         # Interpretação clínica + laudo editável
│   ├── LimbLengthCard.jsx
│   ├── LoginScreen.jsx                # Credenciais de acesso
│   ├── PatientForm.jsx
│   ├── ProfileCard.jsx                # Seleção de população e membro lesionado
│   ├── ResultsDashboard.jsx           # Normalização, composto e assimetria
│   ├── SectionCard.jsx
│   ├── StratifiedInterpretation.jsx   # LSI, classificações por perfil e RTS
│   ├── Toast.jsx
│   └── inputs.jsx                     # Inputs com sanitização numérica
└── lib/
    ├── calculations.js                # Regras de negócio e fórmulas do YBT
    ├── excel.js                       # Geração do arquivo .xlsx
    ├── interpretation.js              # Limiares por população, LSI e retorno ao esporte
    └── report.js                      # Geração do texto do laudo
```
