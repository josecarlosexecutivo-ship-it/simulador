(function initSimulator(globalScope) {
  "use strict";

  const INDIVIDUAL_POLICY = {
    code: "individual",
    label: "Individual / Tradicional",
    firstPct: 1.5,
    recurringPct: 0.22,
    factor: 1,
    note: "150% de agenciamento e 22% recorrente"
  };

  const NIVELADO_POLICIES = [
    { code: "10-a", prazo: "10", label: "10 - A", firstPct: 0, recurringPct: 0.1, delayMonths: 0 },
    { code: "10-b", prazo: "10", label: "10 - B", firstPct: 1, recurringPct: 0.1, delayMonths: 1 },
    { code: "10-c", prazo: "10", label: "10 - C", firstPct: 2, recurringPct: 0.1, delayMonths: 2 },
    { code: "15-a", prazo: "15", label: "15 - A", firstPct: 0, recurringPct: 0.15, delayMonths: 0 },
    { code: "15-b", prazo: "15", label: "15 - B", firstPct: 1, recurringPct: 0.15, delayMonths: 1 },
    { code: "15-c", prazo: "15", label: "15 - C", firstPct: 2, recurringPct: 0.15, delayMonths: 2 },
    { code: "20-a", prazo: "20", label: "20/25 - A", firstPct: 0, recurringPct: 0.2, delayMonths: 0 },
    { code: "20-b", prazo: "20", label: "20/25 - B", firstPct: 1, recurringPct: 0.2, delayMonths: 1 },
    { code: "20-c", prazo: "20", label: "20/25 - C", firstPct: 2, recurringPct: 0.2, delayMonths: 2 },
    { code: "30-a", prazo: "30", label: "30/Vitalicio - A", firstPct: 0, recurringPct: 0.3, delayMonths: 0 },
    { code: "30-b", prazo: "30", label: "30/Vitalicio - B", firstPct: 1, recurringPct: 0.3, delayMonths: 1 },
    { code: "35-a", prazo: "30", label: "35 - A", firstPct: 0, recurringPct: 0.35, delayMonths: 0 },
    { code: "35-b", prazo: "30", label: "35 - B", firstPct: 1, recurringPct: 0.35, delayMonths: 1 },
    { code: "40-a", prazo: "30", label: "40 - A", firstPct: 0, recurringPct: 0.4, delayMonths: 0 }
  ];

  const EMPRESARIAL_POLICIES = [
    { code: "1", label: "Opcao 1 - 125% / 40%", firstPct: 1.25, recurringPct: 0.4, factor: 1 },
    { code: "2", label: "Opcao 2 - 125% / 35%", firstPct: 1.25, recurringPct: 0.35, factor: 0.9 },
    { code: "3", label: "Opcao 3 - 125% / 30%", firstPct: 1.25, recurringPct: 0.3, factor: 0.82 },
    { code: "4", label: "Opcao 4 - 125% / 25%", firstPct: 1.25, recurringPct: 0.25, factor: 0.75 },
    { code: "5", label: "Opcao 5 - 125% / 20%", firstPct: 1.25, recurringPct: 0.2, factor: 0.69 },
    { code: "6", label: "Opcao 6 - 125% / 15%", firstPct: 1.25, recurringPct: 0.15, factor: 0.65 },
    { code: "7", label: "Opcao 7 - 125% / 10%", firstPct: 1.25, recurringPct: 0.1, factor: 0.6 },
    { code: "8", label: "Opcao 8 - 40% / 40%", firstPct: 0.4, recurringPct: 0.4, factor: 0.85, carteiraOnly: true },
    { code: "9", label: "Opcao 9 - 35% / 35%", firstPct: 0.35, recurringPct: 0.35, factor: 0.78, carteiraOnly: true },
    { code: "10", label: "Opcao 10 - 30% / 30%", firstPct: 0.3, recurringPct: 0.3, factor: 0.71, carteiraOnly: true },
    { code: "11", label: "Opcao 11 - 25% / 25%", firstPct: 0.25, recurringPct: 0.25, factor: 0.65, carteiraOnly: true },
    { code: "12", label: "Opcao 12 - 20% / 20%", firstPct: 0.2, recurringPct: 0.2, factor: 0.61, carteiraOnly: true },
    { code: "13", label: "Opcao 13 - 15% / 15%", firstPct: 0.15, recurringPct: 0.15, factor: 0.56, carteiraOnly: true },
    { code: "14", label: "Opcao 14 - 10% / 10%", firstPct: 0.1, recurringPct: 0.1, factor: 0.53, carteiraOnly: true },
    { code: "15", label: "Opcao 15 - 5% / 5%", firstPct: 0.05, recurringPct: 0.05, factor: 0.5, carteiraOnly: true }
  ];

  const scenarioLabels = {
    individual: "Individual",
    nivelado: "Premio Nivelado",
    empresarial: "Empresarial",
    misto: "Misto"
  };

  function formatCurrency(value) {
    const safeValue = Number.isFinite(Number(value)) ? Number(value) : 0;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(safeValue).replace(/\u00a0/g, " ");
  }

  function parseCurrencyToNumber(value) {
    if (typeof value === "number") {
      return Number.isFinite(value) ? value : 0;
    }

    const text = String(value || "").trim();
    if (!text) {
      return 0;
    }

    const cleaned = text
      .replace(/[^\d,.-]/g, "")
      .replace(/\./g, "")
      .replace(",", ".");

    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function normalizeCurrencyInputText(value) {
    const rawValue = String(value || "");
    const digits = rawValue.replace(/\D/g, "");
    return /R\$|[,.]/.test(rawValue) ? parseCurrencyToNumber(rawValue) : (digits ? Number(digits) : 0);
  }

  function clampPositive(value, fallback) {
    const number = Number(value);
    return Number.isFinite(number) && number > 0 ? number : fallback;
  }

  function percentage(value) {
    return `${Math.round((Number(value) || 0) * 100)}%`;
  }

  function formatQuantity(value) {
    return new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: value >= 10 ? 1 : 2,
      maximumFractionDigits: 2
    }).format(Number.isFinite(value) ? value : 0);
  }

  function practicalMonthlySales(value) {
    const number = Number(value);
    if (!Number.isFinite(number) || number <= 0) {
      return 0;
    }
    return Math.max(1, Math.ceil(number));
  }

  function formatPracticalSales(value) {
    const sales = practicalMonthlySales(value);
    return `${sales} ${sales === 1 ? "venda" : "vendas"}`;
  }

  function calculateScenario({ targetMonthly, years, ticket, policy, name }) {
    const months = Math.max(1, Math.round(clampPositive(years, 1) * 12));
    const safeTarget = clampPositive(targetMonthly, 0);
    const safeTicket = clampPositive(ticket, 1);
    const recurringPct = clampPositive(policy.recurringPct, 0);
    const activeMonths = Math.max(1, months - (policy.delayMonths || 0));
    const monthlySales = safeTarget / (safeTicket * recurringPct * activeMonths);
    const monthlySalesGoal = practicalMonthlySales(monthlySales);
    const totalSales = monthlySales * months;
    const monthlyPremium = monthlySales * safeTicket;
    const practicalMonthlyPremium = monthlySalesGoal * safeTicket;
    const recurringAtEnd = monthlySales * safeTicket * recurringPct * activeMonths;
    const monthlyUpfrontEstimate = monthlySales * safeTicket * (Number(policy.firstPct) || 0);

    return {
      name: name || policy.label,
      targetMonthly: safeTarget,
      years: clampPositive(years, 1),
      months,
      ticket: safeTicket,
      policy,
      activeMonths,
      monthlySales,
      monthlySalesGoal,
      totalSales,
      monthlyPremium,
      practicalMonthlyPremium,
      recurringAtEnd,
      monthlyUpfrontEstimate,
      walletIncludesUpfront: false
    };
  }

  function calculateMixedScenario({ targetMonthly, years, tickets, policies }) {
    const lineTarget = clampPositive(targetMonthly, 0) / 3;
    const lines = [
      calculateScenario({
        targetMonthly: lineTarget,
        years,
        ticket: tickets.individual,
        policy: policies.individual,
        name: "Individual"
      }),
      calculateScenario({
        targetMonthly: lineTarget,
        years,
        ticket: tickets.nivelado,
        policy: policies.nivelado,
        name: "Premio Nivelado"
      }),
      calculateScenario({
        targetMonthly: lineTarget,
        years,
        ticket: tickets.empresarial,
        policy: policies.empresarial,
        name: "Empresarial"
      })
    ];

    return summarizeLines(lines);
  }

  function summarizeLines(lines) {
    return {
      lines,
      monthlySales: lines.reduce((sum, item) => sum + item.monthlySales, 0),
      monthlySalesGoal: lines.reduce((sum, item) => sum + item.monthlySalesGoal, 0),
      totalSales: lines.reduce((sum, item) => sum + item.totalSales, 0),
      monthlyPremium: lines.reduce((sum, item) => sum + item.monthlyPremium, 0),
      practicalMonthlyPremium: lines.reduce((sum, item) => sum + item.practicalMonthlyPremium, 0),
      monthlyUpfrontEstimate: lines.reduce((sum, item) => sum + item.monthlyUpfrontEstimate, 0),
      recurringAtEnd: lines.reduce((sum, item) => sum + item.recurringAtEnd, 0),
      walletIncludesUpfront: false
    };
  }

  const api = {
    INDIVIDUAL_POLICY,
    NIVELADO_POLICIES,
    EMPRESARIAL_POLICIES,
    calculateScenario,
    calculateMixedScenario,
    formatCurrency,
    parseCurrencyToNumber,
    normalizeCurrencyInputText,
    nextMoneyDigits,
    practicalMonthlySales,
    formatPracticalSales,
    currentTicketLabel
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  globalScope.SimuladorCarteira = api;

  if (!globalScope.document) {
    return;
  }

  const documentRef = globalScope.document;
  const fields = {
    scenario: documentRef.getElementById("scenario"),
    targetMonthly: documentRef.getElementById("targetMonthly"),
    years: documentRef.getElementById("years"),
    ticketIndividual: documentRef.getElementById("ticketIndividual"),
    ticketNivelado: documentRef.getElementById("ticketNivelado"),
    ticketEmpresarial: documentRef.getElementById("ticketEmpresarial"),
    niveladoPrazo: documentRef.getElementById("niveladoPrazo"),
    niveladoPolicy: documentRef.getElementById("niveladoPolicy"),
    empresarialPolicy: documentRef.getElementById("empresarialPolicy")
  };

  const output = {
    summaryPill: documentRef.getElementById("summary-pill"),
    monthlySales: documentRef.getElementById("metricMonthlySales"),
    monthlySalesHint: documentRef.getElementById("metricMonthlySalesHint"),
    monthlyPremium: documentRef.getElementById("metricMonthlyPremium"),
    recurring: documentRef.getElementById("metricRecurring"),
    lineCards: documentRef.getElementById("lineCards"),
    table: documentRef.getElementById("resultsTable")
  };

  function fillSelect(select, options, selectedCode) {
    select.textContent = "";
    options.forEach((item) => {
      const option = documentRef.createElement("option");
      option.value = item.code;
      option.textContent = item.label;
      if (item.code === selectedCode) {
        option.selected = true;
      }
      select.appendChild(option);
    });
  }

  function visibleNiveladoPolicies() {
    return NIVELADO_POLICIES.filter((item) => item.prazo === fields.niveladoPrazo.value);
  }

  function syncNiveladoSelect() {
    const current = fields.niveladoPolicy.value;
    const visible = visibleNiveladoPolicies();
    const selected = visible.some((item) => item.code === current) ? current : visible[0].code;
    fillSelect(fields.niveladoPolicy, visible, selected);
  }

  function selectedNiveladoPolicy() {
    return NIVELADO_POLICIES.find((item) => item.code === fields.niveladoPolicy.value) || visibleNiveladoPolicies()[0];
  }

  function selectedEmpresarialPolicy() {
    return EMPRESARIAL_POLICIES.find((item) => item.code === fields.empresarialPolicy.value) || EMPRESARIAL_POLICIES[0];
  }

  function getMoney(input) {
    if (input.dataset.value) {
      return parseCurrencyToNumber(input.dataset.value);
    }
    return parseCurrencyToNumber(input.value);
  }

  function moneyDigitsFromValue(value) {
    const rounded = Math.round(clampPositive(value, 0));
    return rounded ? String(rounded) : "";
  }

  function setMoneyFromDigits(input, digits) {
    const normalizedDigits = String(digits || "").replace(/\D/g, "").replace(/^0+(?=\d)/, "");
    const value = normalizedDigits ? Number(normalizedDigits) : 0;
    input.dataset.digits = normalizedDigits;
    input.dataset.value = String(value);
    input.value = formatCurrency(value);
  }

  function nextMoneyDigits({ currentDigits, inputType, data, replacingAll }) {
    const digits = replacingAll ? "" : String(currentDigits || "").replace(/\D/g, "");
    if (inputType === "insertText" && /^\d$/.test(data || "")) {
      return `${digits}${data}`;
    }
    if (inputType === "deleteContentBackward" || inputType === "deleteContentForward") {
      return digits.slice(0, -1);
    }
    return digits;
  }

  function applyMoneyMask(input) {
    const value = parseCurrencyToNumber(input.value);
    setMoneyFromDigits(input, moneyDigitsFromValue(value));
  }

  function handleMoneyTyping(input) {
    const value = normalizeCurrencyInputText(input.value);
    setMoneyFromDigits(input, moneyDigitsFromValue(value));
  }

  function handleMoneyBeforeInput(event) {
    const input = event.currentTarget;
    const type = event.inputType;
    const replacingAll = input.selectionStart === 0 && input.selectionEnd === input.value.length;
    const currentDigits = replacingAll ? "" : (input.dataset.digits || moneyDigitsFromValue(getMoney(input)));

    if (type === "insertText" && /^\d$/.test(event.data || "")) {
      event.preventDefault();
      setMoneyFromDigits(input, nextMoneyDigits({
        currentDigits,
        inputType: type,
        data: event.data,
        replacingAll
      }));
      render();
      return;
    }

    if (type === "deleteContentBackward" || type === "deleteContentForward") {
      event.preventDefault();
      setMoneyFromDigits(input, nextMoneyDigits({
        currentDigits,
        inputType: type,
        data: event.data,
        replacingAll
      }));
      render();
      return;
    }

    if (type === "insertFromPaste") {
      return;
    }

    if (type !== "insertCompositionText") {
      event.preventDefault();
    }
  }

  function setupMoneyInputs() {
    documentRef.querySelectorAll(".money-input").forEach((input) => {
      applyMoneyMask(input);
      input.addEventListener("beforeinput", handleMoneyBeforeInput);
      input.addEventListener("input", () => {
        handleMoneyTyping(input);
        render();
      });
      input.addEventListener("focus", () => {
        input.select();
      });
      input.addEventListener("paste", () => {
        globalScope.setTimeout(() => {
          applyMoneyMask(input);
          render();
        }, 0);
      });
      input.addEventListener("blur", () => {
        applyMoneyMask(input);
        render();
      });
    });
  }

  function currentResult() {
    const scenario = fields.scenario.value;
    const years = clampPositive(fields.years.value, 1);
    const targetMonthly = getMoney(fields.targetMonthly);
    const tickets = {
      individual: getMoney(fields.ticketIndividual),
      nivelado: getMoney(fields.ticketNivelado),
      empresarial: getMoney(fields.ticketEmpresarial)
    };
    const policies = {
      individual: INDIVIDUAL_POLICY,
      nivelado: selectedNiveladoPolicy(),
      empresarial: selectedEmpresarialPolicy()
    };

    if (scenario === "misto") {
      return calculateMixedScenario({ targetMonthly, years, tickets, policies });
    }

    const singleConfig = {
      individual: { ticket: tickets.individual, policy: policies.individual, name: "Individual" },
      nivelado: { ticket: tickets.nivelado, policy: policies.nivelado, name: "Premio Nivelado" },
      empresarial: { ticket: tickets.empresarial, policy: policies.empresarial, name: "Empresarial" }
    }[scenario];

    return summarizeLines([
      calculateScenario({
        targetMonthly,
        years,
        ticket: singleConfig.ticket,
        policy: singleConfig.policy,
        name: singleConfig.name
      })
    ]);
  }

  function currentTicketLabel(result) {
    if (result.lines.length !== 1) {
      return "Ver linhas";
    }
    return formatCurrency(result.lines[0].ticket);
  }

  function makeLineCard(line) {
    const article = documentRef.createElement("article");
    article.className = "line-card";

    const top = documentRef.createElement("div");
    top.className = "line-card__top";

    const title = documentRef.createElement("h3");
    title.textContent = line.name;

    const badge = documentRef.createElement("span");
    badge.className = "line-card__badge";
    badge.textContent = line.policy.label;

    top.append(title, badge);

    const list = documentRef.createElement("dl");
    [
      ["Meta da linha", formatCurrency(line.targetMonthly)],
      ["Venda mensal", formatPracticalSales(line.monthlySales)],
      ["Producao nova", formatCurrency(line.practicalMonthlyPremium)],
      ["Carteira final", formatCurrency(line.recurringAtEnd)]
    ].forEach(([label, value]) => {
      const wrapper = documentRef.createElement("div");
      const dt = documentRef.createElement("dt");
      const dd = documentRef.createElement("dd");
      dt.textContent = label;
      dd.textContent = value;
      wrapper.append(dt, dd);
      list.appendChild(wrapper);
    });

    article.append(top, list);
    return article;
  }

  function makeTableRow(line) {
    const row = documentRef.createElement("tr");
    [
      line.name,
      formatCurrency(line.targetMonthly),
      formatCurrency(line.ticket),
      percentage(line.policy.recurringPct),
      line.policy.carteiraOnly ? "Somente carteira" : percentage(line.policy.firstPct),
      formatPracticalSales(line.monthlySales),
      formatQuantity(line.monthlySales),
      formatQuantity(line.totalSales),
      formatCurrency(line.recurringAtEnd)
    ].forEach((value) => {
      const cell = documentRef.createElement("td");
      cell.textContent = value;
      row.appendChild(cell);
    });
    return row;
  }

  function syncScenarioVisibility() {
    const scenario = fields.scenario.value;
    documentRef.querySelectorAll(".scenario-field").forEach((field) => {
      const scenarios = field.dataset.scenarios.split(" ");
      field.hidden = !scenarios.includes(scenario);
    });
    fields.ticketIndividual.closest(".field").hidden = scenario === "nivelado" || scenario === "empresarial";
    fields.ticketNivelado.closest(".field").hidden = scenario === "individual" || scenario === "empresarial";
    fields.ticketEmpresarial.closest(".field").hidden = scenario === "individual" || scenario === "nivelado";
  }

  function render() {
    syncScenarioVisibility();
    syncNiveladoSelect();

    const result = currentResult();
    const label = scenarioLabels[fields.scenario.value] || "Carteira";

    output.summaryPill.textContent = `${label} recorrente`;
    output.monthlySales.textContent = formatPracticalSales(result.monthlySales);
    output.monthlySalesHint.textContent = result.lines.length > 1 ? "vendas somadas todo mes" : "meta minima todo mes";
    output.monthlyPremium.textContent = currentTicketLabel(result);
    output.recurring.textContent = formatCurrency(result.recurringAtEnd);

    output.lineCards.textContent = "";
    result.lines.forEach((line) => output.lineCards.appendChild(makeLineCard(line)));

    output.table.textContent = "";
    result.lines.forEach((line) => output.table.appendChild(makeTableRow(line)));
  }

  function bindForm() {
    fields.scenario.addEventListener("change", render);
    fields.years.addEventListener("input", render);
    fields.niveladoPrazo.addEventListener("change", () => {
      syncNiveladoSelect();
      render();
    });
    fields.niveladoPolicy.addEventListener("change", render);
    fields.empresarialPolicy.addEventListener("change", render);
  }

  fillSelect(fields.empresarialPolicy, EMPRESARIAL_POLICIES, "1");
  fillSelect(fields.niveladoPolicy, visibleNiveladoPolicies(), "20-b");
  setupMoneyInputs();
  bindForm();
  render();
})(typeof window !== "undefined" ? window : globalThis);
