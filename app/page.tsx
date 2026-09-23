"use client";

import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { supabase } from "./supabase";
import { TABELA_24_ESOCIAL, ItemTabela24 } from "./tabela24";

interface AgenteRegulatorio {
  name: string;
  cas: string;
  typeDefault: "quant" | "qual";
  anexoNR15: string;
  grau: string;
  lt_ppm: number | null;
  unidade: string;
  dec3048: string;
  anosAposentadoria: string;
  linach: string;
  esocial: string;
  legalText: string;
}

const AGENTS_DATABASE: Record<string, AgenteRegulatorio> = {
  benzeno: {
    name: "Benzeno",
    cas: "71-43-2",
    typeDefault: "qual",
    anexoNR15: "Anexo 13-A",
    grau: "Grau Máximo (40%)",
    lt_ppm: null,
    unidade: "VRT",
    dec3048: "Anexo IV, Código 1.0.3",
    anosAposentadoria: "25 Anos",
    linach: "Grupo 1 (Carcinogênico para Humanos)",
    esocial: "01.03.001",
    legalText:
      "O Benzeno possui avaliação disciplinada pela Portaria 3.214/78, Anexo 13-A da NR-15, não existindo limite de tolerância seguro, mas sim Valor de Referência Tecnológico (VRT). No âmbito previdenciário, por estar listado no Grupo 1 da LINACH com registro CAS, sua nocividade é presumida de forma puramente qualitativa conforme o § 4º do art. 68 do Decreto 3.048/99.",
  },
  tolueno: {
    name: "Tolueno",
    cas: "108-88-3",
    typeDefault: "quant",
    anexoNR15: "Anexo 11",
    grau: "Grau Médio (20%)",
    lt_ppm: 78.0,
    unidade: "ppm",
    dec3048: "Anexo IV, Código 1.0.19 (Hidrocarbonetos)",
    anosAposentadoria: "25 Anos",
    linach: "Não consta no Grupo 1",
    esocial: "01.17.002",
    legalText:
      "O Tolueno é avaliado quantitativamente pelo Anexo 11 da NR-15 com Limite de Tolerância fixado em 78 ppm (290 mg/m³), havendo absorção também pela via cutânea. Para o LTCAT, a concessão de aposentadoria especial está vinculada à extrapolação dos limites de exposição ou permanência habitual e intermitente em condições insalubres.",
  },
  xileno: {
    name: "Xileno (Isômeros)",
    cas: "1330-20-7",
    typeDefault: "quant",
    anexoNR15: "Anexo 11",
    grau: "Grau Médio (20%)",
    lt_ppm: 78.0,
    unidade: "ppm",
    dec3048: "Anexo IV, Código 1.0.19 (Hidrocarbonetos)",
    anosAposentadoria: "25 Anos",
    linach: "Não consta no Grupo 1",
    esocial: "01.17.003",
    legalText:
      "O Xileno possui avaliação quantitativa disciplinada pelo Anexo 11 da NR-15 com Limite de Tolerância de 78 ppm. Enquadra-se no grupo de solventes aromáticos do Anexo IV do Decreto 3.048/99.",
  },
  silica: {
    name: "Sílica Livre Cristalizada (Quartzo)",
    cas: "14808-60-7",
    typeDefault: "quant",
    anexoNR15: "Anexo 12",
    grau: "Grau Máximo (40%)",
    lt_ppm: 0.05,
    unidade: "mg/m³",
    dec3048: "Anexo IV, Código 1.0.18 (Poeiras Minerais)",
    anosAposentadoria: "25 Anos",
    linach: "Grupo 1 (Carcinogênico para Humanos)",
    esocial: "01.18.001",
    legalText:
      "A poeira respirável de quartzo (Sílica Livre Cristalizada) é avaliada no Anexo 12 da NR-15. No âmbito previdenciário, integra o Grupo 1 da LINACH, acarretando reconhecimento especial em caso de exposição ocupacional sem que a utilização de EPI elida o direito (Súmula 9 da TNU).",
  },
};

interface AvaliacaoHO {
  id: string;
  created_at?: string;
  data_medicao: string;
  agente: string;
  codigo_esocial: string;
  empresa_nome: string;
  ghe_nome: string;
  funcao: string;
  parametros_campo: string;
  resultado_numerico: string;
  enquadramento: string;
}

export default function Home() {
  const [agenteKey, setAgenteKey] = useState<string>("tolueno");
  const [tipoAvaliacao, setTipoAvaliacao] = useState<"quant" | "qual">("quant");
  const [medicaoValor, setMedicaoValor] = useState<number>(85.5);
  const [epiEficaz, setEpiEficaz] = useState<boolean>(false);
  const [setor, setSetor] = useState<string>("Cabine de Pintura e Limpeza");
  const [ghe, setGhe] = useState<string>("Pintor Industrial / Reparador");
  const [empresa, setEmpresa] = useState<string>("Metalúrgica Amazonas S.A.");
  const [cnpj, setCnpj] = useState<string>("12.345.678/0001-90");
  const [responsavelTecnico, setResponsavelTecnico] = useState<string>("Thiago Soares da Rocha");
  const [crea, setCrea] = useState<string>("CREA/AM - 123456/D");

  // Histórico em Nuvem
  const [historico, setHistorico] = useState<AvaliacaoHO[]>([]);
  const [carregandoNuvem, setCarregandoNuvem] = useState<boolean>(false);

  const agenteAtual = AGENTS_DATABASE[agenteKey] || AGENTS_DATABASE.tolueno;

  const carregarNuvem = async () => {
    try {
      setCarregandoNuvem(true);
      const { data, error } = await supabase
        .from("avaliacoes")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setHistorico(
          data.map((item: any) => ({
            id: item.id,
            data_medicao: item.data_medicao,
            agente: item.agente,
            codigo_esocial: item.codigo_esocial || "01.01.001",
            empresa_nome: item.parametros_campo?.split("|")[0] || empresa,
            ghe_nome: item.parametros_campo?.split("|")[1] || ghe,
            funcao: item.funcao,
            parametros_campo: item.parametros_campo || "",
            resultado_numerico: item.resultado_numerico,
            enquadramento: item.enquadramento,
          }))
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCarregandoNuvem(false);
    }
  };

  useEffect(() => {
    carregarNuvem();
  }, []);

  // --- LÓGICA DE INSALUBRIDADE (NR-15) ---
  let isInsalubre = false;
  let justificativaNR15 = "";

  if (agenteKey === "benzeno") {
    isInsalubre = !epiEficaz;
    justificativaNR15 = epiEficaz
      ? "Exposição neutralizada administrativamente mediante comprovação pericial de eliminação do contato e uso comprovado de proteção respiratória adequada."
      : `Atividade considerada INSALUBRE em ${agenteAtual.grau} com fulcro no Anexo 13-A da NR-15, devido à manipulação habitual do agente sem comprovação integral de neutralização.`;
  } else if (tipoAvaliacao === "quant" && agenteAtual.lt_ppm !== null) {
    if (medicaoValor > agenteAtual.lt_ppm) {
      isInsalubre = !epiEficaz;
      justificativaNR15 = `A concentração apurada (${medicaoValor} ${agenteAtual.unidade}) ULTRAPASSOU o Limite de Tolerância fixado em ${agenteAtual.lt_ppm} ${agenteAtual.unidade}. ${
        epiEficaz
          ? "Contudo, comprovada a eficácia dos EPIs fornecidos com CA válido, a insalubridade resta descaracterizada."
          : `Caracteriza-se o Adicional de Insalubridade em ${agenteAtual.grau} pelo${agenteAtual.anexoNR15} da NR-15.`
      }`;
    } else {
      isInsalubre = false;
      justificativaNR15 = `A concentração apurada (${medicaoValor} ${agenteAtual.unidade}) encontra-se ABAIXO do Limite de Tolerância regulamentar (${agenteAtual.lt_ppm} ${agenteAtual.unidade}). NÃO há direito ao adicional.`;
    }
  } else {
    isInsalubre = true;
    justificativaNR15 = `Enquadramento qualitativo pelo Anexo 13 da NR-15 fundamentado na inspeção do ambiente de trabalho e manipulação contínua do agente químico.`;
  }

  // --- LÓGICA PREVIDENCIÁRIA / LTCAT (DEC. 3.048/99 + LINACH) ---
  let isEspecial = false;
  let justificativaLTCAT = "";
  const isLinachGrupo1 = agenteAtual.linach.includes("Grupo 1");

  if (isLinachGrupo1) {
    isEspecial = true;
    justificativaLTCAT =
      "Agente listado no Grupo 1 da LINACH com número CAS. Nos termos do art. 68, § 4º do Decreto 3.048/99 e da Súmula 9 da TNU, a mera presença do agente nocivo no ambiente garante o tempo especial, SENDO IRRELEVANTE A EFICÁCIA DO EPI.";
  } else if (tipoAvaliacao === "quant" && agenteAtual.lt_ppm !== null) {
    if (medicaoValor > agenteAtual.lt_ppm) {
      isEspecial = true;
      justificativaLTCAT = `Exposição acima do limite de tolerância em conformidade com o Anexo IV do Decreto 3.048/99 (${agenteAtual.dec3048}).`;
    } else {
      isEspecial = false;
      justificativaLTCAT =
        "Concentração mantida abaixo dos limites de tolerância ocupacionais. Ausência de elementos para aposentadoria especial.";
    }
  } else {
    isEspecial = true;
    justificativaLTCAT =
      "Enquadramento especial reconhecido com base na habitualidade e permanência da atividade nociva na área avaliada.";
  }

  // Salvar no Supabase
  const salvarAvaliacaoNuvem = async () => {
    try {
      const { error } = await supabase.from("avaliacoes").insert([
        {
          agente: agenteAtual.name,
          codigo_esocial: agenteAtual.esocial,
          funcao: ghe,
          parametros_campo: `${empresa} | ${setor} | CAS: ${agenteAtual.cas}`,
          resultado_numerico:
            tipoAvaliacao === "quant" ? `${medicaoValor} ${agenteAtual.unidade}` : "Avaliação Qualitativa",
          enquadramento: `${isInsalubre ? "Insalubre" : "Salubre"} | ${
            isEspecial ? "Aposentadoria Especial" : "Comum"
          }`,
          data_medicao: new Date().toISOString().split("T")[0],
        },
      ]);

      if (error) {
        alert(`Erro ao salvar no banco em nuvem: ${error.message}`);
      } else {
        alert("Laudo gravado com sucesso no PostgreSQL (Supabase)!");
        carregarNuvem();
      }
    } catch (e: any) {
      alert(`Falha: ${e.message}`);
    }
  };

  // Exportar Excel
  const exportarParaExcel = () => {
    if (historico.length === 0) {
      alert("Nenhum dado gravado para exportar!");
      return;
    }
    const dados = historico.map((item, idx) => ({
      Item: idx + 1,
      Data: item.data_medicao,
      Agente: item.agente,
      "Código eSocial": item.codigo_esocial,
      Empresa: item.empresa_nome,
      GHE: item.ghe_nome,
      Função: item.funcao,
      Resultado: item.resultado_numerico,
      Enquadramento: item.enquadramento,
    }));
    const ws = XLSX.utils.json_to_sheet(dados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laudos_Periciais");
    XLSX.writeFile(wb, `Laudos_Periciais_${Date.now()}.xlsx`);
  };

  // Gerador XML S-2240
  const gerarXmlS2240 = () => {
    const idEvento = `ID1${cnpj.replace(/\D/g, "").padEnd(14, "0")}${Date.now().toString().slice(-14)}`;
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<eSocial xmlns="http://www.esocial.gov.br/schema/evt/evtExpRisco/v_S_01_02_00">
  <evtExpRisco Id="${idEvento}">
    <ideEvento><tpAmb>1</tpAmb><procEmi>1</procEmi><verProc>HigieneWeb_Pro_1.0</verProc></ideEvento>
    <ideEmpregador><tpInsc>1</tpInsc><nrInsc>${cnpj.replace(/\D/g, "")}</nrInsc></ideEmpregador>
    <ideVinculo><cpfTrab>09876543211</cpfTrab><matricula>MAT-1052</matricula></ideVinculo>
    <infoExpRisco>
      <dtIniCondicao>${new Date().toISOString().split("T")[0]}</dtIniCondicao>
      <infoAmb><localAmb>1</localAmb><dscSetor>${setor}</dscSetor></infoAmb>
      <infoAtiv><dscAtivDes>${ghe} - Enquadramento pericial conforme NR-15 e LTCAT.</dscAtivDes></infoAtiv>
      <agenteNocivo>
        <fatRisco>
          <codFatRisco>${agenteAtual.esocial}</codFatRisco>
          <tpAval>${tipoAvaliacao === "quant" ? "1" : "2"}</tpAval>
          <intConc>${tipoAvaliacao === "quant" ? medicaoValor : "0"}</intConc>
          <unMed>${agenteAtual.unidade}</unMed>
          <epcEpi>
            <utilizEPC>2</utilizEPC>
            <utilizEPI>${epiEficaz ? "2" : "1"}</utilizEPI>
            <epi><docAval>41235</docAval></epi>
          </epcEpi>
        </fatRisco>
      </agenteNocivo>
      <respReg>
        <cpfResp>12345678900</cpfResp><ideOC>1</ideOC><nrOc>123456</nrOc><ufOC>AM</ufOC>
      </respReg>
    </infoExpRisco>
  </evtExpRisco>
</eSocial>`;

    const blob = new Blob([xml], { type: "application/xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `S2240_${agenteAtual.name}_${Date.now()}.xml`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-100 text-slate-900 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        
        {/* TOP BAR DE NAVEGAÇÃO (NO-PRINT) */}
        <header className="print:hidden flex flex-col md:flex-row justify-between items-start md:items-center pb-6 mb-8 border-b border-slate-200 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-0.5 rounded tracking-wide">
                Módulo Pericial
              </span>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                Emissão Técnica: Laudo NR-15 & LTCAT
              </h1>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Enquadramento automático com fundamentação legal cruzada (CLT, Previdência e eSocial)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={salvarAvaliacaoNuvem}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow-sm transition flex items-center gap-1.5"
            >
              <span>💾 Salvar Laudo no Banco</span>
            </button>
            <button
              onClick={exportarParaExcel}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-semibold shadow-sm transition flex items-center gap-1.5"
            >
              <span>📊 Exportar Excel</span>
            </button>
            <button
              onClick={gerarXmlS2240}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition flex items-center gap-1.5"
            >
              <span>⚡ XML S-2240</span>
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm transition flex items-center gap-1.5"
            >
              <span>🖨️ Imprimir Laudo Pericial (A4)</span>
            </button>
          </div>
        </header>

        {/* CORPO PRINCIPAL COM GRID DE 12 COLUNAS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 print:block">
          
          {/* ========================================================
              COLUNA DA ESQUERDA: PARÂMETROS DE AVALIAÇÃO (NO-PRINT)
             ======================================================== */}
          <div className="print:hidden lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="text-indigo-600 font-bold">⚙️</span> Parâmetros da Avaliação Ocupacional
              </h2>

              {/* SELEÇÃO DO AGENTE QUÍMICO */}
              <div className="mb-4">
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Agente Químico Avaliado
                </label>
                <select
                  value={agenteKey}
                  onChange={(e) => {
                    const k = e.target.value;
                    setAgenteKey(k);
                    const novo = AGENTS_DATABASE[k];
                    setTipoAvaliacao(novo.typeDefault);
                    if (novo.lt_ppm) setMedicaoValor(novo.lt_ppm * 1.1);
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="benzeno">Benzeno (CAS 71-43-2)</option>
                  <option value="tolueno">Tolueno (CAS 108-88-3)</option>
                  <option value="xileno">Xileno - Isômeros (CAS 1330-20-7)</option>
                  <option value="silica">Sílica Livre Cristalizada (CAS 14808-60-7)</option>
                </select>
              </div>

              {/* DADOS DA EMPRESA, GHE E SETOR */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Empresa</label>
                  <input
                    type="text"
                    value={empresa}
                    onChange={(e) => setEmpresa(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">CNPJ</label>
                  <input
                    type="text"
                    value={cnpj}
                    onChange={(e) => setCnpj(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Setor / Local</label>
                  <input
                    type="text"
                    value={setor}
                    onChange={(e) => setSetor(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">GHE / Cargo</label>
                  <input
                    type="text"
                    value={ghe}
                    onChange={(e) => setGhe(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* TIPO DE AVALIAÇÃO (QUANTITATIVA OU QUALITATIVA) */}
              <div className="mb-4">
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Abordagem de Avaliação
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTipoAvaliacao("quant")}
                    className={`p-2.5 text-xs font-bold rounded-lg border flex items-center justify-center gap-1 transition ${
                      tipoAvaliacao === "quant"
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                        : "border-slate-300 bg-white text-slate-600"
                    }`}
                  >
                    <span>📈 Quantitativa (Medição)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipoAvaliacao("qual")}
                    className={`p-2.5 text-xs font-bold rounded-lg border flex items-center justify-center gap-1 transition ${
                      tipoAvaliacao === "qual"
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                        : "border-slate-300 bg-white text-slate-600"
                    }`}
                  >
                    <span>👁️ Qualitativa (Inspeção)</span>
                  </button>
                </div>
              </div>

              {/* MEDIÇÕES QUANTITATIVAS */}
              {tipoAvaliacao === "quant" && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg mb-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-700">Resultado da Medição</span>
                    <span className="text-xs font-mono text-slate-500">Unidade: {agenteAtual.unidade}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      step="0.001"
                      value={medicaoValor}
                      onChange={(e) => setMedicaoValor(parseFloat(e.target.value) || 0)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                    <div className="text-xs text-slate-500 shrink-0">
                      LT:{" "}
                      <span className="font-bold text-slate-700">
                        {agenteAtual.lt_ppm ? `${agenteAtual.lt_ppm} ${agenteAtual.unidade}` : "Qualitativo / VRT"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* PROTEÇÕES E CONTROLES (EPI EFICAZ) */}
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 cursor-pointer">
                    EPI Eficaz com CA Válido?
                  </label>
                  <input
                    type="checkbox"
                    checked={epiEficaz}
                    onChange={(e) => setEpiEficaz(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  *Nota pericial: Para agentes cancerígenos (LINACH Grupo 1 com CAS), a jurisprudência previdenciária e a Súmula 9 da TNU desconsideram a eficácia do EPI para elisão de aposentadoria especial.
                </p>
              </div>

              {/* DADOS DO RESPONSÁVEL TÉCNICO */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-200 mt-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Responsável Técnico</label>
                  <input
                    type="text"
                    value={responsavelTecnico}
                    onChange={(e) => setResponsavelTecnico(e.target.value)}
                    className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Registro CREA / CAU</label>
                  <input
                    type="text"
                    value={crea}
                    onChange={(e) => setCrea(e.target.value)}
                    className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* ========================================================
              COLUNA DA DIREITA: PRÉVIA DO LAUDO TÉCNICO (IMPRIMÍVEL)
             ======================================================== */}
          <div className="lg:col-span-7 print:w-full">
            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-slate-800 print:shadow-none print:border-none print:p-0">
              
              {/* CABEÇALHO DO LAUDO */}
              <div className="border-b-2 border-slate-800 pb-4 mb-6 flex justify-between items-start">
                <div>
                  <div className="text-xs font-black uppercase tracking-widest text-indigo-700">
                    Parecer Técnico Pericial Conclusivo
                  </div>
                  <h2 className="text-xl font-black text-slate-900 mt-0.5">
                    ENQUADRAMENTO NR-15 E LTCAT
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Conformidade: Portaria MTE 3.214/78 & Decreto Federal 3.048/99
                  </p>
                </div>
                <div className="text-right text-xs text-slate-500">
                  <div>
                    Data de Emissão:{" "}
                    <span className="font-bold text-slate-700">
                      {new Date().toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  <div className="mt-1 font-mono text-[11px] text-slate-400">
                    ID: HO-LAUDO-2026-9482
                  </div>
                </div>
              </div>

              {/* IDENTIFICAÇÃO DO POSTO AVALIADO */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6 text-xs grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-400 font-bold uppercase block">GHE / Grupo Homogêneo:</span>
                  <span className="font-semibold text-slate-800 text-sm">{ghe}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase block">Setor Avaliado:</span>
                  <span className="font-semibold text-slate-800 text-sm">{setor}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase block">Agente Químico:</span>
                  <span className="font-bold text-indigo-700 text-sm">{agenteAtual.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase block">Registro CAS:</span>
                  <span className="font-mono font-bold text-slate-800 text-sm">{agenteAtual.cas}</span>
                </div>
              </div>

              {/* SEÇÃO 1: CONCLUSÃO DE INSALUBRIDADE (NR-15) */}
              <div className="mb-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                  <span className="text-indigo-600 font-bold">🛡️</span> 1. Conclusão Trabalhista - Adicional de Insalubridade (NR-15)
                </h3>
                <div
                  className={`p-4 rounded-lg border transition ${
                    isInsalubre ? "border-rose-200 bg-rose-50/60" : "border-emerald-200 bg-emerald-50/60"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-xs font-black px-2.5 py-1 rounded tracking-wide ${
                        isInsalubre ? "bg-rose-600 text-white" : "bg-emerald-600 text-white"
                      }`}
                    >
                      {isInsalubre ? "FAZ JUS À INSALUBRIDADE" : "NÃO CARACTERIZADA INSALUBRIDADE"}
                    </span>
                    <span
                      className={`text-xs font-bold ${
                        isInsalubre ? "text-rose-700" : "text-emerald-700"
                      }`}
                    >
                      {isInsalubre ? agenteAtual.grau : "Não aplicável"}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed">{justificativaNR15}</p>
                </div>
              </div>

              {/* SEÇÃO 2: CONCLUSÃO DE APOSENTADORIA ESPECIAL (LTCAT) */}
              <div className="mb-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                  <span className="text-indigo-600 font-bold">📋</span> 2. Conclusão Previdenciária - Aposentadoria Especial (LTCAT)
                </h3>
                <div
                  className={`p-4 rounded-lg border transition ${
                    isEspecial ? "border-purple-200 bg-purple-50/60" : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-xs font-black px-2.5 py-1 rounded tracking-wide ${
                        isEspecial ? "bg-purple-700 text-white" : "bg-slate-500 text-white"
                      }`}
                    >
                      {isEspecial ? "GERA APOSENTADORIA ESPECIAL" : "TEMPO COMUM (SEM APOSENTADORIA ESPECIAL)"}
                    </span>
                    <span
                      className={`text-xs font-bold ${
                        isEspecial ? "text-purple-800" : "text-slate-500"
                      }`}
                    >
                      {isEspecial ? `Tempo: ${agenteAtual.anosAposentadoria}` : "Não elegível"}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed mb-3">{justificativaLTCAT}</p>

                  {/* TABELA ESOCIAL E LINACH */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-white/70 p-2.5 rounded border border-slate-200">
                    <div>
                      <span className="text-slate-400 block font-medium">Código eSocial (Tab. 24):</span>
                      <span className="font-mono font-bold text-slate-800">{agenteAtual.esocial}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Classificação LINACH:</span>
                      <span className="font-bold text-slate-800">{agenteAtual.linach}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SEÇÃO 3: EMBASAMENTO LEGAL COMPLETO */}
              <div className="mb-8">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  3. Fundamentação Técnica e Jurídica Consolidada
                </h3>
                <div className="text-[11px] text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
                  <p>{agenteAtual.legalText}</p>
                  <p className="border-t border-slate-200 pt-2 font-medium text-slate-700">
                    {isLinachGrupo1
                      ? "⚠️ Alerta Técnico Previdenciário: Por tratar-se de agente cancerígeno humano comprovado (Grupo 1), a eficácia de EPI (respiradores com CA) NÃO anula o lançamento do código de risco no evento S-2240 do eSocial nem retira o direito à aposentadoria especial."
                      : "Adoção de EPIs com Certificado de Aprovação (CA) válido atenua a exposição para fins trabalhistas da CLT, desde que comprovado o treinamento e fiscalização contínua de uso."}
                  </p>
                </div>
              </div>

              {/* ASSINATURA TÉCNICA */}
              <div className="mt-12 pt-6 border-t border-slate-300 grid grid-cols-2 gap-8 text-center text-xs">
                <div>
                  <div className="border-b border-slate-400 mb-1 w-48 mx-auto"></div>
                  <span className="font-bold text-slate-800 block">{empresa}</span>
                  <span className="text-slate-400 text-[10px]">Empregador / Preposto</span>
                </div>
                <div>
                  <div className="border-b border-slate-400 mb-1 w-48 mx-auto"></div>
                  <span className="font-bold text-slate-800 block">{responsavelTecnico}</span>
                  <span className="text-slate-400 text-[10px]">{crea}</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}