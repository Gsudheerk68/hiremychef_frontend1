import { useState } from 'react'
import DashHeader from '../../components/common/DashHeader'
import Input from '../../components/common/Input'
import Textarea from '../../components/common/Textarea'
import Button from '../../components/common/Button'
import ChefCard from '../../components/common/ChefCard'
import { useDash } from '../../layouts/DashboardLayout'
import { useToast } from '../../context/ToastContext'
import { chefsService } from '../../services/chefsService'

const list = (s) => s.split(',').map((x) => x.trim()).filter(Boolean)
export default function ChefProfile() {
  const { chef, reloadChef } = useDash(); const toast = useToast()
  const [f, setF] = useState({ bio: chef.bio || '', city: chef.city || '', years: chef.years ?? 0, price: chef.price ?? 0, photo: chef.photo || '', cuisines: chef.cuisines.join(', '), certifications: (chef.certifications || []).join(', '), available: chef.available })
  const [err, setErr] = useState({}); const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const submit = async (e) => {
    e.preventDefault(); const er = {}
    if (!f.city.trim()) er.city = 'Enter your city'
    if (!(f.years >= 0 && f.years <= 60) || f.years === '') er.years = '0 to 60'
    if (!(f.price >= 0 && f.price <= 1000000) || f.price === '') er.price = '0 to 10,00,000'
    if (f.bio.length > 2000) er.bio = 'Maximum 2000 characters'
    if (f.photo && !/^https?:\/\//.test(f.photo)) er.photo = 'Must start with http:// or https://'
    if (list(f.cuisines).length > 10 || list(f.certifications).length > 10) er.cuisines = 'Maximum 10 items per list'
    if ([...list(f.cuisines), ...list(f.certifications)].some((x) => x.length > 60)) er.cuisines = 'Each item must be 60 characters or fewer'
    setErr(er); if (Object.keys(er).length) return
    setBusy(true)
    try {
      await chefsService.updateMe({ bio: f.bio.trim() || null, city: f.city.trim(), years_experience: Number(f.years), price_per_session: Number(f.price), photo_url: f.photo.trim() || null,
        cuisines: list(f.cuisines), certifications: list(f.certifications), is_available: f.available })
      toast('Profile saved'); reloadChef()
    } catch (x) { toast(x.message, 'error') } finally { setBusy(false) }
  }
  const preview = { ...chef, bio: f.bio, city: f.city, years: Number(f.years) || 0, price: Number(f.price) || 0, photo: f.photo, cuisines: list(f.cuisines), available: f.available }
  return <>
    <DashHeader title="My profile" text="This is what customers see on your public page." />
    <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
      <form onSubmit={submit} noValidate className="card space-y-4 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="City" value={f.city} error={err.city} onChange={set('city')} />
          <Input label="Years of experience" type="number" min="0" max="60" value={f.years} error={err.years} onChange={set('years')} />
          <Input label="Price per session (₹)" type="number" min="0" value={f.price} error={err.price} onChange={set('price')} />
          <Input label="Photo URL" placeholder="https://…" value={f.photo} error={err.photo} onChange={set('photo')} />
          <Input label="Cuisines (comma separated)" className="sm:col-span-2" value={f.cuisines} error={err.cuisines} onChange={set('cuisines')} />
          <Input label="Certifications (comma separated)" className="sm:col-span-2" value={f.certifications} onChange={set('certifications')} /></div>
        <Textarea label="About you" rows={5} value={f.bio} error={err.bio} onChange={set('bio')} hint={`${f.bio.length}/2000`} />
        <label className="flex items-center gap-3 text-sm font-medium"><input type="checkbox" className="h-4 w-4 accent-brand-600" checked={f.available} onChange={(e) => setF({ ...f, available: e.target.checked })} />I am currently accepting new bookings</label>
        <Button type="submit" loading={busy}>Save changes</Button></form>
      <div><p className="label">Preview</p><ChefCard chef={preview} /><p className="mt-3 text-xs text-ink-700/70">Your verification status is controlled by the admin team and cannot be edited here.</p></div></div></>
}
