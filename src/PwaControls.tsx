import { useEffect, useState, useSyncExternalStore } from 'react'
import { ArrowDownToLine, CheckCircle2, CloudOff, MoreVertical, PlusSquare, RefreshCw, Share, Smartphone } from 'lucide-react'
import { Dialog } from './ui'
import { applyPwaUpdate, getPwaState, subscribePwa } from './pwa-registration'

interface InstallPrompt extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
}

export default function PwaControls() {
  const { offlineReady, updateReady, registrationError } = useSyncExternalStore(subscribePwa, getPwaState)
  const [installed, setInstalled] = useState(isStandalone)
  const [offline, setOffline] = useState(!navigator.onLine)
  const [prompt, setPrompt] = useState<InstallPrompt | null>(null)
  const [dialog, setDialog] = useState<'install' | 'update' | null>(null)
  const [busy, setBusy] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [platform, setPlatform] = useState<'android' | 'ios'>(() =>
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) ? 'ios' : 'android')

  useEffect(() => {
    const offerInstall = (event: Event) => { event.preventDefault(); setPrompt(event as InstallPrompt) }
    const didInstall = () => { setInstalled(true); setPrompt(null); setDialog(null) }
    const connectivity = () => setOffline(!navigator.onLine)
    const display = window.matchMedia('(display-mode: standalone)')
    const displayChanged = () => setInstalled(isStandalone())
    window.addEventListener('beforeinstallprompt', offerInstall)
    window.addEventListener('appinstalled', didInstall)
    window.addEventListener('online', connectivity)
    window.addEventListener('offline', connectivity)
    display.addEventListener('change', displayChanged)
    return () => {
      window.removeEventListener('beforeinstallprompt', offerInstall)
      window.removeEventListener('appinstalled', didInstall)
      window.removeEventListener('online', connectivity)
      window.removeEventListener('offline', connectivity)
      display.removeEventListener('change', displayChanged)
    }
  }, [])

  async function install() {
    if (!prompt || busy) return
    setBusy(true)
    setFeedback('')
    try {
      await prompt.prompt()
      const choice = await prompt.userChoice
      setPrompt(null)
      setFeedback(choice.outcome === 'accepted'
        ? 'Pedido confirmado. O navegador está adicionando o MooSPA ao seu dispositivo.'
        : 'Tudo bem. Você pode instalar depois pelo menu do navegador.')
    } catch {
      setPrompt(null)
      setFeedback('Use o menu do navegador para adicionar o MooSPA. Veja o passo a passo abaixo.')
    } finally { setBusy(false) }
  }

  return <>
    <div className="pwa-actions">
      {offline && <span className="pwa-offline" role="status" title="Você está sem internet"><CloudOff size={16} /><span>Offline</span></span>}
      {updateReady && <button className="pwa-update-button" aria-label="Atualizar MooSPA" onClick={() => { setFeedback(''); setDialog('update') }}><RefreshCw size={16} /><span>Atualizar</span></button>}
      {!installed && <button className="install-app-button" aria-label="Instalar MooSPA" onClick={() => { setFeedback(''); setDialog('install') }}><ArrowDownToLine size={17} /><span>Instalar app</span></button>}
    </div>
    {dialog === 'install' && <Dialog title="MooSPA no seu celular" onClose={() => setDialog(null)}>
      <div className="install-intro">
        <img src={`${import.meta.env.BASE_URL}icons/icon-192.png`} width="64" height="64" alt="Ícone do MooSPA" />
        <div><h3>O cuidado, sempre por perto.</h3><p>Adicione à tela inicial e abra como um app, com seu próprio ícone.</p></div>
      </div>
      {prompt && <button className="button primary full-width install-native" disabled={busy} onClick={() => void install()}><ArrowDownToLine size={17} />{busy ? 'Aguardando o navegador…' : 'Instalar agora'}</button>}
      <div className="install-platforms" role="group" aria-label="Seu celular">
        <button className={platform === 'android' ? 'selected' : ''} aria-pressed={platform === 'android'} onClick={() => setPlatform('android')}>Android</button>
        <button className={platform === 'ios' ? 'selected' : ''} aria-pressed={platform === 'ios'} onClick={() => setPlatform('ios')}>iPhone / iPad</button>
      </div>
      {platform === 'ios' ? <ol className="install-steps">
        <li><span><Smartphone size={18} /></span><div><strong>Abra no Safari</strong><p>Acesse este mesmo endereço no Safari do seu iPhone ou iPad.</p></div></li>
        <li><span><Share size={18} /></span><div><strong>Toque em Compartilhar</strong><p>Use o botão de compartilhar ou procure essa opção no menu da página.</p></div></li>
        <li><span><PlusSquare size={18} /></span><div><strong>Adicionar à Tela de Início</strong><p>Se aparecer “Abrir como App da Web”, deixe ativado. Depois toque em Adicionar.</p></div></li>
      </ol> : <ol className="install-steps">
        <li><span><Smartphone size={18} /></span><div><strong>Abra no Chrome</strong><p>Acesse este endereço no navegador do celular.</p></div></li>
        <li><span><MoreVertical size={18} /></span><div><strong>Abra o menu do navegador</strong><p>Toque nos três pontos e procure Instalar app ou Adicionar à tela inicial.</p></div></li>
        <li><span><ArrowDownToLine size={18} /></span><div><strong>Confirme a instalação</strong><p>O ícone do MooSPA fica junto dos seus outros aplicativos.</p></div></li>
      </ol>}
      {feedback && <p className="install-feedback" role="status">{feedback}</p>}
      <div className={`install-offline-note ${offlineReady ? 'ready' : ''}`} role="status">
        {offlineReady ? <CheckCircle2 size={19} /> : <CloudOff size={19} />}
        <div><strong>{offlineReady ? 'Pronto para usar sem internet' : registrationError ? 'Modo offline ainda indisponível' : 'Uma primeira visita com internet'}</strong>
          <p>{offlineReady ? 'A demo já está disponível offline neste navegador.' : registrationError ? 'Você pode continuar explorando. Reconecte e reabra o app para tentar preparar o modo offline.' : 'Mantenha a página aberta por alguns instantes para preparar a demo para uso offline.'}</p></div>
      </div>
      <p className="small-print">Os dados continuam fictícios. Seus cuidados e simulações são reiniciados ao recarregar o app.</p>
    </Dialog>}
    {dialog === 'update' && <Dialog title="Tem novidade no MooSPA" onClose={() => setDialog(null)}>
      <p className="dialog-subtitle">Uma nova versão está pronta. Ao atualizar, a demo reabre com os dados iniciais; as simulações e os cuidados desta sessão são reiniciados.</p>
      {feedback && <p className="install-feedback" role="status">{feedback}</p>}
      <div className="dialog-actions"><button className="button secondary" onClick={() => setDialog(null)}>Mais tarde</button><button className="button primary" onClick={() => { if (!applyPwaUpdate()) setFeedback('A atualização ainda está sendo preparada. Tente novamente em alguns instantes.') }}><RefreshCw size={16} /> Atualizar e reabrir</button></div>
    </Dialog>}
  </>
}
