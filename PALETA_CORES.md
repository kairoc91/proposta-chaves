# Paleta de Cores do Projeto (Pantone & Brand Identity)

Este documento contém as especificações técnicas da paleta de cores oficial do projeto, extraídas da tabela Pantone.

---

## 🎨 Visão Geral da Paleta

| Cor | Nome / Código Pantone | HEX | RGB | HSB | CMYK | Tipo de Tinta |
|---|---|---|---|---|---|---|
| 🟢 Verde Claro | **PANTONE 9580 C** | `#DBFFC9` | 219, 255, 201 | 100°, 21%, 100% | 13, 0, 28, 0 | Process |
| 🟢 Verde Neon | **PANTONE 902 C** | `#97FF66` | 151, 255, 102 | 101°, 60%, 100% | 39, 0, 85, 0 | Process |
| 🌑 Verde Escuro / Black | **PANTONE 5463 C** | `#00241E` | 0, 36, 30 | 170°, 100%, 14% | 84, 57, 70, 74 | Process |

---

## 📋 Especificações Detalhadas

### 1. PANTONE 9580 C (Verde Claro Suave)
- **Código Hexadecimal:** `#DBFFC9`
- **RGB:** `219, 255, 201`
- **HSB:** `100, 21%, 100%`
- **CMYK:** `13, 0, 28, 0`
- **Ink Type:** Process
- **Uso Recomendado:** Fundos suaves, badges secundários, elementos de destaque leve e superfícies com menor contraste.

### 2. PANTONE 902 C (Verde Neon / Primário)
- **Código Hexadecimal:** `#97FF66`
- **RGB:** `151, 255, 102`
- **HSB:** `101, 60%, 100%`
- **CMYK:** `39, 0, 85, 0`
- **Ink Type:** Process
- **Uso Recomendado:** Cor de destaque principal (Accent/Primary), botões de ação (CTA), estados ativos, bordas destacadas e elementos interativos.

### 3. PANTONE 5463 C (Verde Profundo / Dark Background)
- **Código Hexadecimal:** `#00241E`
- **RGB:** `0, 36, 30`
- **HSB:** `170, 100%, 14%`
- **CMYK:** `84, 57, 70, 74`
- **Ink Type:** Process
- **Uso Recomendado:** Fundo principal do modo escuro, containers estruturais, superfícies de alto contraste e fundos profundos.

---

## 🌙 Tema Escuro de Alto Contraste (Dark Branding - Pantone 5463 C & 902 C)

Nesta configuração, o fundo do aplicativo utiliza o **PANTONE 5463 C (`RGB 0, 36, 30` / `#00241E`)**, com tipografia, botões de ação e destaques no **PANTONE 902 C (`RGB 151, 255, 102` / `#97FF66`)**, criando um contraste neon futurista e de altíssima legibilidade.

```css
:root {
  /* Brand Color Palette - Pantone Official Specifications */
  --color-pantone-9580c: #dbffc9; /* Soft Light Green */
  --color-pantone-902c:  rgb(151, 255, 102); /* #97FF66 - Vibrant Neon Green */
  --color-pantone-5463c: rgb(0, 36, 30); /* #00241E - Deep Dark Green */

  /* Mapeamento Semântico Oficial - Dark Contrast Theme */
  --bg-primary: rgb(0, 36, 30); /* #00241E - Dark Background */
  --card-bg: rgba(0, 36, 30, 0.88);
  --text-primary: rgb(151, 255, 102); /* #97FF66 - Neon Green Text */
  --color-primary: rgb(151, 255, 102); /* #97FF66 */
}
```
