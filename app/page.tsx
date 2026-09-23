"use client";

import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { supabase } from "./supabase";

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
  instrumento_utilizado?: string;
  certificado_calibracao?: string;
}

export default function Home() {
  const [moduloAtivo, setModuloAtivo] = useState<
    "ruido" | "calor" | "quimico" | "vibracao" | "esocial" | "historico" | "laudo"
  >("ruido");

  // --- EMPRESA & RESPONSÁVEL TÉCNICO ---
  const [empresa, setEmpresa] = useState("Metalúrgica Amazonas S.A.");
  const [cnpj, setCnpj] = useState("12345678000190");
  const [ghe, setGhe] = useState("GHE 01 - Usinagem e Corte");
  const [funcao, setFuncao] = useState("Operador de Centro de Usinagem");
  const [responsavelTecnico, setResponsavelTecnico] = useState("Thiago Soares da Rocha");
  const [cpfResponsavel, setCpfResponsavel] = useState("12345678900");
  const [crea, setCrea] = useState("CREA/AM - 123456/D");

  // --- DADOS DO TRABALHADOR (eSocial S-2240) ---
  const [cpfTrabalhador, setCpfTrabalhador] = useState("09876543211");
  const [matriculaTrabalhador, setMatriculaTrabalhador] = useState("MAT-1052");
  const [dataInicioCondicao, setDataInicioCondicao] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [caEpi, setCaEpi] = useState("41235");

  // --- METROLOGIA ---
  const [equipamentoNome, setEquipamentoNome] = useState("Dosímetro / Acelerômetro Digital Integrador");
  const [certificadoCalibracao, setCertificadoCalibracao] = useState("CAL-2026/8941 - Laboratório Acreditado RBC");

  // --- RUÍDO ---
  const [tTrabalhoMinutos, setTTrabalhoMinutos] = useState<number>(480);
  const [tAmostradoMinutos, setTAmostradoMinutos] = useState<number>(420);
  const [laeq, setLaeq] = useState<number>(86.5);
  const [nrrSf, setNrrSf] = useState<number>(15);

  // --- CALOR ---
  const [comCargaSolar, setComCargaSolar] = useState<boolean>(false);
  const [tbn, setTbn] = useState<number>(24.0);
  const [tg, setTg] = useState<number>(32.0);
  const [tbs, setTbs] = useState<number>(28.0);
  const [taxaMetabolica, setTaxaMetabolica] = useState<number>(300);

  // --- QUÍMICO ---
  const [substancia, setSubstancia] = useState("Tolueno");
  const [massaColetadaMg, setMassaColetadaMg] = useState<number>(1.2);
  const [vazaoBombaLpm, setVazaoBombaLpm] = useState<number>(2.0);
  const [tempoColetaMin, setTempoColetaMin] = useState<number>(240);
  const [limiteToleranciaMgM3, setLimiteToleranciaMgM3] = useState<number>(290);

  // --- VIBRAÇÃO ---
  const [tipoVibracao, setTipoVibracao] = useState<"vmb" | "vci">("vmb");
  const [tempoExpVibMinutos, setTempoExpVibMinutos] = useState<number>(360);
  const [awx, setAwx] = useState<number>(2.1);
  const [awy, setAwy] = useState<number>(1.8);
  const [awz, setAwz] = useState<number>(3.4);
  const [vdvrMedido, setVdvrMedido] = useState<number>(10.5);

  // --- BANCO DE DADOS NA NUVEM (SUPABASE / POSTGRESQL) ---
  const [historico, setHistorico] = useState<AvaliacaoHO[]>([]);
  const [carregando, setCarregando] = useState<boolean>(false);

  // Função para buscar dados da nuvem
  const carregarHistoricoNuvem = async () => {
    try {
      setCarregando(true);
      const { data, error } = await supabase
        .from("avaliacoes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao carregar do Supabase:", error.message);
      } else if (data) {
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
            instrumento_utilizado: item.instrumento_utilizado,
            certificado_calibracao: item.certificado_calibracao,
          }))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarHistoricoNuvem();
  }, []);

  // Salvar medição direto no Supabase
  const salvarNoBancoNuvem = async (novoRegistro: {
    agente: string;
    codigo_esocial: string;
    funcao: string;
    parametros_campo: string;
    resultado_numerico: string;
    enquadramento: string;
  }) => {
    try {
      const { data, error } = await supabase.from("avaliacoes").insert([
        {
          agente: novoRegistro.agente,
          codigo_esocial: novoRegistro.codigo_esocial,
          funcao: novoRegistro.funcao,
          parametros_campo: `${empresa} | ${ghe} | ${novoRegistro.parametros_campo}`,
          resultado_numerico: novoRegistro.resultado_numerico,
          enquadramento: novoRegistro.enquadramento,
          instrumento_utilizado: equipamentoNome,
          certificado_calibracao: certificadoCalibracao,
          data_medicao: new Date().toISOString().split("T")[0],
        },
      ]).select();

      if (error) {
        alert(`Erro ao salvar no banco em nuvem: ${error.message}`);
      } else {
        alert("Avaliação registrada com sucesso no PostgreSQL (Supabase)!");
        carregarHistoricoNuvem();
      }
    } catch (e: any) {
      alert(`Falha: ${e.message}`);
    }
  };

  // Excluir medição da nuvem
  const excluirAvaliacaoNuvem = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover esta avaliação do banco em nuvem?")) return;
    try {
      const { error } = await supabase.from("avaliacoes").delete().eq("id", id);
      if (error) {
        alert(`Erro ao excluir: ${error.message}`);
      } else {
        setHistorico(historico.filter((h) => h.id !== id));
      }
    } catch (e: any) {
      alert(`Falha: ${e.message}`);
    }
  };

  // EXPORTAÇÃO EXCEL
  const exportarParaExcel = () => {
    if (historico.length === 0) {
      alert("Nenhum dado cadastrado para exportar!");
      return;
    }
    const dadosPlanilha = historico.map((item, index) => ({
      Item: index + 1,
      Data: item.data_medicao,
      Agente: item.agente,
      "Código eSocial": item.codigo_esocial,
      Empresa: item.empresa_nome,
      GHE: item.ghe_nome,
      Função: item.funcao,
      "Parâmetros de Campo": item.parametros_campo,
      Resultado: item.resultado_numerico,
      "Conclusão Legal": item.enquadramento,
    }));
    const worksheet = XLSX.utils.json_to_sheet(dadosPlanilha);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Banco_HO_Nuvem");
    XLSX.writeFile(workbook, `Banco_Higiene_Nuvem_${Date.now()}.xlsx`);
  };

  // CÁLCULOS TÉCNICOS
  const calcularNR15 = () => {
    const tPermitido = 480 / Math.pow(2, (laeq - 85) / 5);
    const doseProjetada = (tTrabalhoMinutos / tPermitido) * 100;
    const exposicaoComEpi = laeq - nrrSf;
    return {
      tPermitido: Math.round(tPermitido),
      doseProjetada: Number(doseProjetada.toFixed(2)),
      exposicaoComEpi: Number(exposicaoComEpi.toFixed(1)),
      insalubre: doseProjetada > 100,
    };
  };

  const calcularNHO01 = () => {
    const nen = laeq + 10 * Math.log10(tAmostradoMinutos / tTrabalhoMinutos);
    const doseNHO = (tTrabalhoMinutos / 480) * Math.pow(10, (laeq - 85) / 10) * 100;
    return {
      nen: Number(nen.toFixed(1)),
      doseNHO: Number(doseNHO.toFixed(2)),
      nivelAcao: nen >= 82,
      critico: nen > 85,
    };
  };

  const calcularCalor = () => {
    const ibutg = comCargaSolar ? 0.7 * tbn + 0.2 * tg + 0.1 * tbs : 0.7 * tbn + 0.3 * tg;
    let limite = 30.0;
    if (taxaMetabolica <= 180) limite = 30.6;
    else if (taxaMetabolica <= 300) limite = 28.0;
    else if (taxaMetabolica <= 415) limite = 25.9;
    else limite = 25.0;

    return {
      ibutg: Number(ibutg.toFixed(1)),
      limite,
      acimaLimite: ibutg > limite,
      atingiuAcao: ibutg >= limite - 2.4,
    };
  };

  const calcularQuimico = () => {
    const volumeM3 = (vazaoBombaLpm * tempoColetaMin) / 1000;
    const concentracaoMgM3 = volumeM3 > 0 ? massaColetadaMg / volumeM3 : 0;
    return {
      volumeM3: Number(volumeM3.toFixed(3)),
      concentracaoMgM3: Number(concentracaoMgM3.toFixed(2)),
      acimaLT: concentracaoMgM3 > limiteToleranciaMgM3,
      atingiuAcao: concentracaoMgM3 >= limiteToleranciaMgM3 * 0.5,
    };
  };

  const calcularVibracao = () => {
    const razaoTempo = tempoExpVibMinutos / 480;
    if (tipoVibracao === "vmb") {
      const aw = Math.sqrt(Math.pow(awx, 2) + Math.pow(awy, 2) + Math.pow(awz, 2));
      const aren = aw * Math.sqrt(razaoTempo);
      return {
        tipo: "Mãos e Braços (VMB)",
        aw: Number(aw.toFixed(2)),
        aren: Number(aren.toFixed(2)),
        vdvr: null,
        acimaLT: aren > 5.0,
        atingiuAcao: aren >= 2.5,
      };
    } else {
      const awPonderado = Math.sqrt(
        Math.pow(1.4 * awx, 2) + Math.pow(1.4 * awy, 2) + Math.pow(1.0 * awz, 2)
      );
      const aren = awPonderado * Math.sqrt(razaoTempo);
      const vdvrTotal = vdvrMedido * Math.pow(razaoTempo, 0.25);
      return {
        tipo: "Corpo Inteiro (VCI)",
        aw: Number(awPonderado.toFixed(2)),
        aren: Number(aren.toFixed(2)),
        vdvr: Number(vdvrTotal.toFixed(2)),
        acimaLT: aren > 1.1 || vdvrTotal > 21.0,
        atingiuAcao: aren >= 0.5 || vdvrTotal >= 9.1,
      };
    }
  };

  const rNR15 = calcularNR15();
  const rNHO = calcularNHO01();
  const rCalor = calcularCalor();
  const rQuimico = calcularQuimico();
  const rVib = calcularVibracao();

  // XML S-2240
  const gerarXmlS2240 = () => {
    const idEvento = `ID1${cnpj.padEnd(14, "0")}${Date.now().toString().slice(-14)}`;
    const xmlConteudo = `<?xml version="1.0" encoding="UTF-8"?>
<eSocial xmlns="http://www.esocial.gov.br/schema/evt/evtExpRisco/v_S_01_02_00">
  <evtExpRisco Id="${idEvento}">
    <ideEvento>
      <tpAmb>1</tpAmb>
      <procEmi>1</procEmi>
      <verProc>HigieneWeb_Pro_Postgres</verProc>
    </ideEvento>
    <ideEmpregador>
      <tpInsc>1</tpInsc>
      <nrInsc>${cnpj.replace(/\D/g, "")}</nrInsc>
    </ideEmpregador>
    <ideVinculo>
      <cpfTrab>${cpfTrabalhador.replace(/\D/g, "")}</cpfTrab>
      <matricula>${matriculaTrabalhador}</matricula>
    </ideVinculo>
    <infoExpRisco>
      <dtIniCondicao>${dataInicioCondicao}</dtIniCondicao>
      <infoAmb>
        <localAmb>1</localAmb>
        <dscSetor>${ghe}</dscSetor>
      </infoAmb>
      <infoAtiv>
        <dscAtivDes>${funcao} - Atividades operacionais cadastradas no PostgreSQL.</dscAtivDes>
      </infoAtiv>
      <agenteNocivo>
        <fatRisco>
          <codFatRisco>01.01.001</codFatRisco>
          <tpAval>1</tpAval>
          <intConc>${rNHO.nen}</intConc>
          <unMed>dB(A)</unMed>
          <epcEpi>
            <utilizEPC>2</utilizEPC>
            <utilizEPI>2</utilizEPI>
            <epi><docAval>${caEpi}</docAval></epi>
          </epcEpi>
        </fatRisco>
      </agenteNocivo>
      <respReg>
        <cpfResp>${cpfResponsavel.replace(/\D/g, "")}</cpfResp>
        <ideOC>1</ideOC>
        <nrOc>${crea.replace(/\D/g, "")}</nrOc>
        <ufOC>AM</ufOC>
      </respReg>
    </infoExpRisco>
  </evtExpRisco>
</eSocial>`;

    const blob = new Blob([xmlConteudo], { type: "application/xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `S2240_${cnpj}_${cpfTrabalhador}.xml`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans">
      
      {/* HEADER */}
      <header className="print:hidden bg-slate-900 text-white px-8 py-4 shadow-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <span className="text-xl font-black tracking-tight text-emerald-400">
            HigieneWeb Pro
          </span>
          <span className="text-[11px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            PostgreSQL Nuvem Conectado
          </span>
        </div>

        <nav className="flex items-center space-x-1.5 flex-wrap">
          <button
            onClick={() => setModuloAtivo("ruido")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              moduloAtivo === "ruido" ? "bg-emerald-500 text-slate-950 font-bold" : "text-slate-300 hover:bg-slate-800"
            }`}
          >
            Ruído
          </button>
          <button
            onClick={() => setModuloAtivo("calor")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              moduloAtivo === "calor" ? "bg-emerald-500 text-slate-950 font-bold" : "text-slate-300 hover:bg-slate-800"
            }`}
          >
            Calor
          </button>
          <button
            onClick={() => setModuloAtivo("quimico")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              moduloAtivo === "quimico" ? "bg-emerald-500 text-slate-950 font-bold" : "text-slate-300 hover:bg-slate-800"
            }`}
          >
            Químicos
          </button>
          <button
            onClick={() => setModuloAtivo("vibracao")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              moduloAtivo === "vibracao" ? "bg-emerald-500 text-slate-950 font-bold" : "text-slate-300 hover:bg-slate-800"
            }`}
          >
            Vibração
          </button>
          <button
            onClick={() => setModuloAtivo("esocial")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              moduloAtivo === "esocial" ? "bg-blue-500 text-white font-black" : "bg-slate-800 text-blue-300 hover:bg-slate-700"
            }`}
          >
            🛡️ eSocial S-2240
          </button>
          <button
            onClick={() => {
              setModuloAtivo("historico");
              carregarHistoricoNuvem();
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              moduloAtivo === "historico" ? "bg-emerald-500 text-slate-950 font-bold" : "text-slate-300 hover:bg-slate-800"
            }`}
          >
            Histórico Nuvem ({historico.length})
          </button>
          <button
            onClick={() => setModuloAtivo("laudo")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              moduloAtivo === "laudo" ? "bg-amber-400 text-slate-950" : "bg-slate-800 text-amber-300 hover:bg-slate-700"
            }`}
          >
            📄 Laudo A4
          </button>
        </nav>
      </header>

      {/* CONTEÚDO */}
      <main className="max-w-7xl mx-auto p-6 print:p-0 print:max-w-full">
        
        {/* IDENTIFICAÇÃO GERAL */}
        {moduloAtivo !== "historico" && moduloAtivo !== "laudo" && moduloAtivo !== "esocial" && (
          <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm mb-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Identificação do Posto & Empresa
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Empresa</label>
                <input
                  type="text"
                  value={empresa}
                  onChange={(e) => setEmpresa(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">CNPJ</label>
                <input
                  type="text"
                  value={cnpj}
                  onChange={(e) => setCnpj(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">GHE / Setor</label>
                <input
                  type="text"
                  value={ghe}
                  onChange={(e) => setGhe(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Função / Cargo</label>
                <input
                  type="text"
                  value={funcao}
                  onChange={(e) => setFuncao(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 font-medium"
                />
              </div>
            </div>
          </section>
        )}

        {/* RUÍDO */}
        {moduloAtivo === "ruido" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
                  Dados da Medição de Ruído
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Jornada (min)</label>
                    <input
                      type="number"
                      value={tTrabalhoMinutos}
                      onChange={(e) => setTTrabalhoMinutos(Number(e.target.value))}
                      className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Tempo Amostrado (min)</label>
                    <input
                      type="number"
                      value={tAmostradoMinutos}
                      onChange={(e) => setTAmostradoMinutos(Number(e.target.value))}
                      className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">LAeq / Lavg (dBA)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={laeq}
                      onChange={(e) => setLaeq(Number(e.target.value))}
                      className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 font-bold text-emerald-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">EPI NRRsf (dB)</label>
                    <input
                      type="number"
                      value={nrrSf}
                      onChange={(e) => setNrrSf(Number(e.target.value))}
                      className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 font-bold"
                    />
                  </div>
                </div>
              </section>

              <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-xs font-medium text-slate-500 uppercase">NR-15 (Trabalhista q=5)</span>
                    <div className="text-2xl font-black mt-1 text-slate-900">Dose {rNR15.doseProjetada}%</div>
                    <div className="mt-2">
                      {rNR15.insalubre ? (
                        <span className="text-xs px-2.5 py-1 bg-rose-100 text-rose-700 font-bold rounded">Insalubre</span>
                      ) : (
                        <span className="text-xs px-2.5 py-1 bg-emerald-100 text-emerald-700 font-bold rounded">Salubre</span>
                      )}
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-xs font-medium text-slate-500 uppercase">NHO-01 / eSocial (q=3)</span>
                    <div className="text-2xl font-black mt-1 text-slate-900">NEN {rNHO.nen} dBA</div>
                    <div className="mt-2">
                      {rNHO.critico ? (
                        <span className="text-xs px-2.5 py-1 bg-rose-100 text-rose-700 font-bold rounded">&gt; Limite Tolerância</span>
                      ) : rNHO.nivelAcao ? (
                        <span className="text-xs px-2.5 py-1 bg-amber-100 text-amber-800 font-bold rounded">&gt; Nível de Ação</span>
                      ) : (
                        <span className="text-xs px-2.5 py-1 bg-emerald-100 text-emerald-700 font-bold rounded">Aceitável</span>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => {
                  salvarNoBancoNuvem({
                    agente: "Ruído",
                    codigo_esocial: "01.01.001",
                    funcao,
                    parametros_campo: `LAeq: ${laeq} dBA | NRRsf: ${nrrSf} dB`,
                    resultado_numerico: `Dose: ${rNR15.doseProjetada}% | NEN: ${rNHO.nen} dBA`,
                    enquadramento: rNR15.insalubre ? "Insalubre (NR-15)" : "Salubre (NR-15)",
                  });
                }}
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg shadow-sm flex items-center justify-center gap-2"
              >
                <span>💾 Salvar no PostgreSQL (Nuvem)</span>
              </button>
            </div>
          </div>
        )}

        {/* CALOR */}
        {moduloAtivo === "calor" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
                  Termômetro de Globo (NHO-06)
                </h2>
                <div className="mb-4">
                  <label className="flex items-center space-x-2 text-sm text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={comCargaSolar}
                      onChange={(e) => setComCargaSolar(e.target.checked)}
                      className="rounded border-slate-300 text-emerald-600 h-4 w-4"
                    />
                    <span>Com carga solar direta</span>
                  </label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Tbn - Bulbo Úmido (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={tbn}
                      onChange={(e) => setTbn(Number(e.target.value))}
                      className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Tg - Globo (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={tg}
                      onChange={(e) => setTg(Number(e.target.value))}
                      className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 font-bold"
                    />
                  </div>
                  {comCargaSolar && (
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Tbs - Bulbo Seco (°C)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={tbs}
                        onChange={(e) => setTbs(Number(e.target.value))}
                        className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 font-bold text-amber-600"
                      />
                    </div>
                  )}
                </div>
              </section>
            </div>

            <div className="space-y-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm text-center">
                <span className="text-xs font-medium text-slate-500 uppercase">IBUTG Médio</span>
                <div className="text-3xl font-black text-slate-900 mt-1">{rCalor.ibutg} °C</div>
                <div className="text-xs text-slate-500 mt-2">Limite: {rCalor.limite} °C</div>
              </div>
              <button
                onClick={() => {
                  salvarNoBancoNuvem({
                    agente: "Calor",
                    codigo_esocial: "01.18.001",
                    funcao,
                    parametros_campo: `Tbn: ${tbn}°C | Tg: ${tg}°C`,
                    resultado_numerico: `IBUTG: ${rCalor.ibutg} °C`,
                    enquadramento: rCalor.acimaLimite ? "Acima do Limite" : "Aceitável",
                  });
                }}
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg shadow-sm flex items-center justify-center gap-2"
              >
                <span>💾 Salvar no PostgreSQL (Nuvem)</span>
              </button>
            </div>
          </div>
        )}

        {/* QUÍMICOS */}
        {moduloAtivo === "quimico" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
                  Amostragem Química
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Substância</label>
                    <input
                      type="text"
                      value={substancia}
                      onChange={(e) => setSubstancia(e.target.value)}
                      className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Limite (mg/m³)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={limiteToleranciaMgM3}
                      onChange={(e) => setLimiteToleranciaMgM3(Number(e.target.value))}
                      className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 font-bold"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Massa (mg)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={massaColetadaMg}
                      onChange={(e) => setMassaColetadaMg(Number(e.target.value))}
                      className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Vazão (L/min)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={vazaoBombaLpm}
                      onChange={(e) => setVazaoBombaLpm(Number(e.target.value))}
                      className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Tempo (min)</label>
                    <input
                      type="number"
                      value={tempoColetaMin}
                      onChange={(e) => setTempoColetaMin(Number(e.target.value))}
                      className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 font-bold"
                    />
                  </div>
                </div>
              </section>
            </div>

            <div className="space-y-4">
              <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-xs font-semibold text-slate-500 uppercase block mb-1">Concentração</span>
                <div className="text-3xl font-black text-slate-900 mb-1">{rQuimico.concentracaoMgM3} mg/m³</div>
              </section>
              <button
                onClick={() => {
                  salvarNoBancoNuvem({
                    agente: "Químico",
                    codigo_esocial: "02.01.774",
                    funcao,
                    parametros_campo: `Substância: ${substancia}`,
                    resultado_numerico: `Conc: ${rQuimico.concentracaoMgM3} mg/m³`,
                    enquadramento: rQuimico.acimaLT ? "Acima do L.T." : "Aceitável",
                  });
                }}
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg shadow-sm flex items-center justify-center gap-2"
              >
                <span>💾 Salvar no PostgreSQL (Nuvem)</span>
              </button>
            </div>
          </div>
        )}

        {/* VIBRAÇÃO */}
        {moduloAtivo === "vibracao" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex gap-4 mb-4">
                  <button
                    onClick={() => setTipoVibracao("vmb")}
                    className={`flex-1 py-2 px-4 rounded-lg font-bold text-xs border ${
                      tipoVibracao === "vmb" ? "bg-slate-900 text-white" : "bg-white text-slate-700"
                    }`}
                  >
                    VMB - Mãos e Braços
                  </button>
                  <button
                    onClick={() => setTipoVibracao("vci")}
                    className={`flex-1 py-2 px-4 rounded-lg font-bold text-xs border ${
                      tipoVibracao === "vci" ? "bg-slate-900 text-white" : "bg-white text-slate-700"
                    }`}
                  >
                    VCI - Corpo Inteiro
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Tempo (min)</label>
                    <input
                      type="number"
                      value={tempoExpVibMinutos}
                      onChange={(e) => setTempoExpVibMinutos(Number(e.target.value))}
                      className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">awx</label>
                    <input
                      type="number"
                      step="0.01"
                      value={awx}
                      onChange={(e) => setAwx(Number(e.target.value))}
                      className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">awy</label>
                    <input
                      type="number"
                      step="0.01"
                      value={awy}
                      onChange={(e) => setAwy(Number(e.target.value))}
                      className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">awz</label>
                    <input
                      type="number"
                      step="0.01"
                      value={awz}
                      onChange={(e) => setAwz(Number(e.target.value))}
                      className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 font-bold"
                    />
                  </div>
                </div>
              </section>
            </div>

            <div className="space-y-4">
              <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm text-center">
                <span className="text-xs text-slate-500 uppercase font-semibold">aren</span>
                <div className="text-3xl font-black text-slate-900 mt-1">{rVib.aren} m/s²</div>
              </section>
              <button
                onClick={() => {
                  salvarNoBancoNuvem({
                    agente: tipoVibracao === "vmb" ? "Vibração VMB" : "Vibração VCI",
                    codigo_esocial: tipoVibracao === "vmb" ? "01.02.001" : "01.02.002",
                    funcao,
                    parametros_campo: `aw: ${rVib.aw} m/s² | Texp: ${tempoExpVibMinutos}min`,
                    resultado_numerico: `aren: ${rVib.aren} m/s²`,
                    enquadramento: rVib.acimaLT ? "Acima do L.T." : "Aceitável",
                  });
                }}
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg shadow-sm flex items-center justify-center gap-2"
              >
                <span>💾 Salvar no PostgreSQL (Nuvem)</span>
              </button>
            </div>
          </div>
        )}

        {/* eSocial S-2240 */}
        {moduloAtivo === "esocial" && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    🛡️ Gerador do Evento S-2240 (eSocial SST)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Integrado ao banco de dados PostgreSQL.
                  </p>
                </div>
                <button
                  onClick={gerarXmlS2240}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow transition-all flex items-center gap-2"
                >
                  ⚡ Baixar Arquivo XML (S-2240)
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200 mb-6">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">CPF Trabalhador</label>
                  <input
                    type="text"
                    value={cpfTrabalhador}
                    onChange={(e) => setCpfTrabalhador(e.target.value)}
                    className="w-full text-xs font-bold border border-slate-300 rounded px-2.5 py-2 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Matrícula</label>
                  <input
                    type="text"
                    value={matriculaTrabalhador}
                    onChange={(e) => setMatriculaTrabalhador(e.target.value)}
                    className="w-full text-xs font-bold border border-slate-300 rounded px-2.5 py-2 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Data Início</label>
                  <input
                    type="date"
                    value={dataInicioCondicao}
                    onChange={(e) => setDataInicioCondicao(e.target.value)}
                    className="w-full text-xs font-bold border border-slate-300 rounded px-2.5 py-2 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">CA EPI</label>
                  <input
                    type="text"
                    value={caEpi}
                    onChange={(e) => setCaEpi(e.target.value)}
                    className="w-full text-xs font-bold border border-slate-300 rounded px-2.5 py-2 bg-white"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* HISTÓRICO SINCRONIZADO NA NUVEM */}
        {moduloAtivo === "historico" && (
          <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  Banco Central de Avaliações
                  {carregando && <span className="text-xs text-emerald-600 font-normal animate-pulse">Sincronizando...</span>}
                </h2>
                <p className="text-xs text-slate-500">
                  Dados armazenados no PostgreSQL do Supabase. Acessíveis de qualquer lugar.
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={carregarHistoricoNuvem}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                >
                  🔄 Atualizar
                </button>
                <button
                  onClick={exportarParaExcel}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
                >
                  Exportar para Excel (.xlsx)
                </button>
              </div>
            </div>

            {historico.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                Nenhum registro encontrado no banco de dados em nuvem.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase bg-slate-50">
                      <th className="py-3 px-3">Data</th>
                      <th className="py-3 px-3">Agente</th>
                      <th className="py-3 px-3">Cód. eSocial</th>
                      <th className="py-3 px-3">Empresa / Posto</th>
                      <th className="py-3 px-3">Função</th>
                      <th className="py-3 px-3">Resultado</th>
                      <th className="py-3 px-3">Enquadramento</th>
                      <th className="py-3 px-3 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {historico.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="py-3 px-3 font-mono text-xs text-slate-500">{item.data_medicao}</td>
                        <td className="py-3 px-3 font-bold text-xs">{item.agente}</td>
                        <td className="py-3 px-3 font-mono text-xs font-bold text-blue-700">{item.codigo_esocial}</td>
                        <td className="py-3 px-3 font-medium text-slate-900">
                          {item.empresa_nome} <span className="text-xs text-slate-400 block">{item.ghe_nome}</span>
                        </td>
                        <td className="py-3 px-3 text-slate-700">{item.funcao}</td>
                        <td className="py-3 px-3 text-xs font-semibold text-slate-800">{item.resultado_numerico}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`text-xs px-2 py-0.5 rounded font-bold ${
                              item.enquadramento.includes("Insalubre") || item.enquadramento.includes("Acima")
                                ? "bg-rose-100 text-rose-700"
                                : "bg-emerald-100 text-emerald-700"
                            }`}
                          >
                            {item.enquadramento}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => excluirAvaliacaoNuvem(item.id)}
                            className="text-xs font-semibold text-rose-600 hover:text-rose-800"
                          >
                            Excluir
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* LAUDO TÉCNICO A4 */}
        {moduloAtivo === "laudo" && (
          <div className="space-y-6">
            <div className="print:hidden bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-bold text-slate-800">Folha de Parecer Técnico / Laudo Pericial de HO</h2>
                <p className="text-xs text-slate-500">Visualização fiel ao documento impresso A4.</p>
              </div>
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow transition-all flex items-center gap-2"
              >
                🖨️ Imprimir Laudo / Salvar como PDF
              </button>
            </div>

            {/* FOLHA A4 */}
            <div className="bg-white p-12 rounded-xl shadow-lg border border-slate-300 max-w-4xl mx-auto print:shadow-none print:border-none print:p-0 print:m-0">
              <div className="border-b-2 border-slate-900 pb-4 mb-6 flex justify-between items-end">
                <div>
                  <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase">
                    Laudo Técnico de Higiene Ocupacional
                  </h1>
                  <p className="text-xs text-slate-600 font-semibold mt-0.5">
                    Subsidio para PGR (NR-01), Laudo de Insalubridade (NR-15) e LTCAT / eSocial S-2240
                  </p>
                </div>
                <div className="text-right text-xs text-slate-500">
                  Data: <strong className="text-slate-800">{new Date().toLocaleDateString("pt-BR")}</strong>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-xs font-black uppercase text-slate-900 bg-slate-100 px-2 py-1 mb-2 border-l-4 border-slate-900">
                  1. Dados da Empresa e do Posto de Trabalho
                </h3>
                <div className="grid grid-cols-2 text-xs gap-y-1.5 px-2">
                  <div><strong>Razão Social:</strong> {empresa}</div>
                  <div><strong>CNPJ:</strong> {cnpj}</div>
                  <div><strong>GHE / Setor Avaliado:</strong> {ghe}</div>
                  <div><strong>Cargo / Função Avaliada:</strong> {funcao}</div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-xs font-black uppercase text-slate-900 bg-slate-100 px-2 py-1 mb-2 border-l-4 border-slate-900">
                  2. Metodologia e Instrumentação Aplicada
                </h3>
                <div className="grid grid-cols-1 text-xs gap-y-1.5 px-2">
                  <div><strong>Equipamento de Medição:</strong> {equipamentoNome}</div>
                  <div><strong>Rastreabilidade Metrológica:</strong> {certificadoCalibracao}</div>
                  <div><strong>Normas Regulamentadoras:</strong> NR-01, NR-09, NR-15, NHO-01, NHO-06, NHO-09 e NHO-10.</div>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-xs font-black uppercase text-slate-900 bg-slate-100 px-2 py-1 mb-2 border-l-4 border-slate-900">
                  3. Quadro Quantitativo de Medições e Enquadramento Técnico
                </h3>
                <table className="w-full text-xs border border-slate-300 mb-4">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300 text-slate-700">
                      <th className="p-2 text-left border-r border-slate-300">Agente Ambiental</th>
                      <th className="p-2 text-left border-r border-slate-300">Cód. eSocial</th>
                      <th className="p-2 text-left border-r border-slate-300">Valor Encontrado</th>
                      <th className="p-2 text-left border-r border-slate-300">Limite Tolerância</th>
                      <th className="p-2 text-left">Conclusão Legal</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 font-bold border-r border-slate-300">Ruído Contínuo/Intermitente</td>
                      <td className="p-2 font-mono border-r border-slate-300">01.01.001</td>
                      <td className="p-2 border-r border-slate-300">Dose {rNR15.doseProjetada}% | NEN {rNHO.nen} dBA</td>
                      <td className="p-2 border-r border-slate-300">Dose 100% / 85.0 dBA</td>
                      <td className="p-2 font-bold">{rNR15.insalubre ? "Insalubre" : "Salubre"}</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 font-bold border-r border-slate-300">Sobrecarga Térmica (Calor)</td>
                      <td className="p-2 font-mono border-r border-slate-300">01.18.001</td>
                      <td className="p-2 border-r border-slate-300">IBUTG {rCalor.ibutg} °C</td>
                      <td className="p-2 border-r border-slate-300">{rCalor.limite} °C</td>
                      <td className="p-2 font-bold">{rCalor.acimaLimite ? "Acima do Limite" : "Conforme"}</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 font-bold border-r border-slate-300">Vapores / Agentes Químicos</td>
                      <td className="p-2 font-mono border-r border-slate-300">02.01.774</td>
                      <td className="p-2 border-r border-slate-300">{rQuimico.concentracaoMgM3} mg/m³</td>
                      <td className="p-2 border-r border-slate-300">{limiteToleranciaMgM3} mg/m³</td>
                      <td className="p-2 font-bold">{rQuimico.acimaLT ? "Acima do Limite" : "Conforme"}</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold border-r border-slate-300">Vibração Ocupacional</td>
                      <td className="p-2 font-mono border-r border-slate-300">{tipoVibracao === "vmb" ? "01.02.001" : "01.02.002"}</td>
                      <td className="p-2 border-r border-slate-300">aren: {rVib.aren} m/s²</td>
                      <td className="p-2 border-r border-slate-300">{tipoVibracao === "vmb" ? "5.0 m/s²" : "1.1 m/s²"}</td>
                      <td className="p-2 font-bold">{rVib.acimaLT ? "Insalubre" : "Conforme"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-14 pt-6 border-t border-slate-300 grid grid-cols-2 gap-8 text-center text-xs">
                <div>
                  <div className="w-3/4 mx-auto border-b border-slate-400 pb-1 mb-1 font-semibold text-slate-800">
                    {empresa}
                  </div>
                  <div className="text-slate-500 text-[11px]">Representante Legal da Empresa</div>
                </div>

                <div>
                  <div className="w-3/4 mx-auto border-b border-slate-400 pb-1 mb-1 font-bold text-slate-900">
                    {responsavelTecnico}
                  </div>
                  <div className="text-slate-600 font-medium text-[11px]">{crea}</div>
                  <div className="text-slate-400 text-[10px]">Engenheiro / Responsável Técnico</div>
                </div>
              </div>

            </div>
          </div>
        )}

      </main>
    </div>
  );
}