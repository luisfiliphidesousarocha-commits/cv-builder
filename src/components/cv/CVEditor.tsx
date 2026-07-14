import { useCV } from "@/lib/cv-store";
import type {
  CVData,
  Experience,
  Education,
  Course,
  Certification,
  Project,
  Skill,
  Language,
  Volunteer,
  Reference,
  SectionKey,
  SkillLevel,
  Lang,
  PhotoShape,
  LayoutKind,
} from "@/lib/cv-types";
import { t, ui, sectionTitle } from "@/lib/cv-i18n";
import { THEMES, FONTS } from "@/lib/cv-themes";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Trash2, User } from "lucide-react";
import { useRef } from "react";

export function CVEditor() {
  const { data, update, set } = useCV();
  const lang = data.lang;
  const L = ui[lang];

  return (
    <div className="space-y-3">
      <Accordion type="multiple" defaultValue={["personal", "profile", "experience"]} className="space-y-2">
        <PersonalSection />
        <SimpleTextSection sectionKey="profile" label={L.profileText} field="profile" />
        <ExperienceSection />
        <EducationSection />
        <SkillsSection />
        <LanguagesSection />
        <ListSection<Course>
          keyName="courses"
          label={sectionTitle("courses", lang)}
          empty={() => ({ id: crypto.randomUUID(), name: "", institution: "", year: "" })}
          render={(item, upd) => (
            <div className="grid grid-cols-2 gap-2">
              <Field label={L.course} value={item.name} onChange={(v) => upd({ name: v })} />
              <Field label={L.institution} value={item.institution} onChange={(v) => upd({ institution: v })} />
              <Field label={L.year} value={item.year} onChange={(v) => upd({ year: v })} />
            </div>
          )}
        />
        <ListSection<Certification>
          keyName="certifications"
          label={sectionTitle("certifications", lang)}
          empty={() => ({ id: crypto.randomUUID(), name: "", issuer: "", year: "" })}
          render={(item, upd) => (
            <div className="grid grid-cols-2 gap-2">
              <Field label={L.name} value={item.name} onChange={(v) => upd({ name: v })} />
              <Field label={L.institution} value={item.issuer} onChange={(v) => upd({ issuer: v })} />
              <Field label={L.year} value={item.year} onChange={(v) => upd({ year: v })} />
            </div>
          )}
        />
        <ListSection<Project>
          keyName="projects"
          label={sectionTitle("projects", lang)}
          empty={() => ({ id: crypto.randomUUID(), title: "", description: "", link: "", tech: "" })}
          render={(item, upd) => (
            <div className="grid grid-cols-2 gap-2">
              <Field label={L.projectTitle} value={item.title} onChange={(v) => upd({ title: v })} />
              <Field label={L.link} value={item.link} onChange={(v) => upd({ link: v })} />
              <Field
                className="col-span-2"
                label={L.tech}
                value={item.tech}
                onChange={(v) => upd({ tech: v })}
              />
              <TextArea
                className="col-span-2"
                label={L.description}
                value={item.description}
                onChange={(v) => upd({ description: v })}
              />
            </div>
          )}
        />
        <ListSection<Volunteer>
          keyName="volunteers"
          label={sectionTitle("volunteer", lang)}
          empty={() => ({ id: crypto.randomUUID(), org: "", role: "", description: "" })}
          render={(item, upd) => (
            <div className="grid grid-cols-2 gap-2">
              <Field label={L.org} value={item.org} onChange={(v) => upd({ org: v })} />
              <Field label={L.role} value={item.role} onChange={(v) => upd({ role: v })} />
              <TextArea
                className="col-span-2"
                label={L.description}
                value={item.description}
                onChange={(v) => upd({ description: v })}
              />
            </div>
          )}
        />
        <SimpleTextSection sectionKey="objectives" label={sectionTitle("objectives", lang)} field="objectives" />
        <SimpleTextSection sectionKey="additional" label={sectionTitle("additional", lang)} field="additional" />
        <ReferencesSection />
        <CustomizeSection />
        <ReorderSection />
      </Accordion>

      <div className="flex flex-wrap gap-2 pt-2">
        <Select value={lang} onValueChange={(v) => set("lang", v as Lang)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pt">🇧🇷 Português</SelectItem>
            <SelectItem value="es">🇪🇸 Español</SelectItem>
            <SelectItem value="en">🇺🇸 English</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

// ---------- shared field helpers ----------

function Field({
  label,
  value,
  onChange,
  className,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  className?: string;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div className={className}>
      <Label className="text-xs font-medium mb-1 block">{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
  className,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  className?: string;
  rows?: number;
}) {
  return (
    <div className={className}>
      <Label className="text-xs font-medium mb-1 block">{label}</Label>
      <Textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} />
    </div>
  );
}

function Panel({
  value,
  title,
  children,
}: {
  value: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <AccordionItem value={value} className="border rounded-lg bg-card">
      <AccordionTrigger className="px-4 py-3 text-sm font-semibold hover:no-underline">
        {title}
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">{children}</AccordionContent>
    </AccordionItem>
  );
}

// ---------- Personal ----------

function PersonalSection() {
  const { data, update } = useCV();
  const p = data.personal;
  const L = ui[data.lang];
  const fileRef = useRef<HTMLInputElement>(null);

  const setP = <K extends keyof typeof p>(k: K, v: (typeof p)[K]) =>
    update({ personal: { ...p, [k]: v } });

  const onPhoto = (f: File | undefined) => {
    if (!f) return;
    const r = new FileReader();
    r.onload = () => setP("photo", r.result as string);
    r.readAsDataURL(f);
  };

  return (
    <Panel value="personal" title={L.personal}>
      <div className="grid grid-cols-2 gap-2">
        <div className="col-span-2 flex items-center gap-3">
          {p.photo ? (
            <img src={p.photo} alt="" className="w-16 h-16 rounded-full object-cover border" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <User className="w-6 h-6 text-muted-foreground" />
            </div>
          )}
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
              {L.photo}
            </Button>
            {p.photo && (
              <Button type="button" variant="ghost" size="sm" onClick={() => setP("photo", "")}>
                {L.remove}
              </Button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => onPhoto(e.target.files?.[0])}
            />
          </div>
        </div>
        <Field label={L.name} value={p.name} onChange={(v) => setP("name", v)} />
        <Field label={L.jobTitle} value={p.title} onChange={(v) => setP("title", v)} />
        <Field label={L.email} type="email" value={p.email} onChange={(v) => setP("email", v)} />
        <Field label={L.phone} value={p.phone} onChange={(v) => setP("phone", v)} />
        <Field label={L.city} value={p.city} onChange={(v) => setP("city", v)} />
        <Field label={L.country} value={p.country} onChange={(v) => setP("country", v)} />
        <Field label={L.linkedin} value={p.linkedin} onChange={(v) => setP("linkedin", v)} />
        <Field label={L.github} value={p.github} onChange={(v) => setP("github", v)} />
        <Field label={L.website} value={p.website} onChange={(v) => setP("website", v)} />
        <Field
          label={L.birthdate}
          value={p.birthdate ?? ""}
          onChange={(v) => setP("birthdate", v)}
        />
        <Field
          label={L.driverLicense}
          value={p.driverLicense ?? ""}
          onChange={(v) => setP("driverLicense", v)}
        />
        <Field
          label={L.nationality}
          value={p.nationality ?? ""}
          onChange={(v) => setP("nationality", v)}
        />
      </div>
      {p.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email) && (
        <p className="text-xs text-destructive mt-2">{L.invalidEmail}</p>
      )}
    </Panel>
  );
}

// ---------- Simple text ----------

function SimpleTextSection({
  sectionKey,
  label,
  field,
}: {
  sectionKey: SectionKey;
  label: string;
  field: "profile" | "objectives" | "additional";
}) {
  const { data, set } = useCV();
  return (
    <Panel value={sectionKey} title={label}>
      <Textarea value={data[field]} onChange={(e) => set(field, e.target.value)} rows={5} />
    </Panel>
  );
}

// ---------- List sections (generic) ----------

function SortableRow({
  id,
  onRemove,
  children,
}: {
  id: string;
  onRemove: () => void;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
      }}
      className="border rounded-lg p-3 bg-background"
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          className="p-1 text-muted-foreground hover:text-foreground cursor-grab touch-none"
          {...attributes}
          {...listeners}
          aria-label="drag"
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">{children}</div>
        <Button type="button" variant="ghost" size="icon" onClick={onRemove}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

function ListSection<T extends { id: string }>({
  keyName,
  label,
  empty,
  render,
}: {
  keyName: keyof CVData & string;
  label: string;
  empty: () => T;
  render: (item: T, upd: (patch: Partial<T>) => void) => React.ReactNode;
}) {
  const { data, set } = useCV();
  const L = ui[data.lang];
  const items = data[keyName] as unknown as T[];

  const setItems = (next: T[]) => set(keyName as never, next as never);
  const upd = (id: string, patch: Partial<T>) =>
    setItems(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  const remove = (id: string) => setItems(items.filter((i) => i.id !== id));
  const add = () => setItems([...items, empty()]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));
  const onEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldI = items.findIndex((i) => i.id === active.id);
    const newI = items.findIndex((i) => i.id === over.id);
    setItems(arrayMove(items, oldI, newI));
  };

  return (
    <Panel value={keyName} title={label}>
      <div className="space-y-2">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onEnd}>
          <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            {items.map((item) => (
              <SortableRow key={item.id} id={item.id} onRemove={() => remove(item.id)}>
                {render(item, (patch) => upd(item.id, patch))}
              </SortableRow>
            ))}
          </SortableContext>
        </DndContext>
        <Button type="button" variant="outline" size="sm" onClick={add} className="w-full">
          <Plus className="w-4 h-4 mr-1" /> {L.add}
        </Button>
      </div>
    </Panel>
  );
}

// ---------- Experience ----------

function ExperienceSection() {
  const { data } = useCV();
  const L = ui[data.lang];
  return (
    <ListSection<Experience>
      keyName="experiences"
      label={sectionTitle("experience", data.lang)}
      empty={() => ({
        id: crypto.randomUUID(),
        company: "",
        role: "",
        city: "",
        start: "",
        end: "",
        current: false,
        description: "",
      })}
      render={(item, upd) => (
        <div className="grid grid-cols-2 gap-2">
          <Field label={L.company} value={item.company} onChange={(v) => upd({ company: v })} />
          <Field label={L.role} value={item.role} onChange={(v) => upd({ role: v })} />
          <Field label={L.city} value={item.city} onChange={(v) => upd({ city: v })} />
          <div />
          <Field label={L.start} value={item.start} onChange={(v) => upd({ start: v })} placeholder="2022-01" />
          <Field
            label={L.end}
            value={item.end}
            onChange={(v) => upd({ end: v })}
            placeholder="2024-06"
          />
          <label className="col-span-2 flex items-center gap-2 text-xs">
            <Checkbox
              checked={item.current}
              onCheckedChange={(c) => upd({ current: Boolean(c) })}
            />
            {L.current}
          </label>
          <TextArea
            className="col-span-2"
            label={L.description}
            value={item.description}
            onChange={(v) => upd({ description: v })}
          />
        </div>
      )}
    />
  );
}

function EducationSection() {
  const { data } = useCV();
  const L = ui[data.lang];
  return (
    <ListSection<Education>
      keyName="educations"
      label={sectionTitle("education", data.lang)}
      empty={() => ({
        id: crypto.randomUUID(),
        institution: "",
        course: "",
        city: "",
        start: "",
        end: "",
        description: "",
      })}
      render={(item, upd) => (
        <div className="grid grid-cols-2 gap-2">
          <Field label={L.institution} value={item.institution} onChange={(v) => upd({ institution: v })} />
          <Field label={L.course} value={item.course} onChange={(v) => upd({ course: v })} />
          <Field label={L.city} value={item.city} onChange={(v) => upd({ city: v })} />
          <div />
          <Field label={L.start} value={item.start} onChange={(v) => upd({ start: v })} />
          <Field label={L.end} value={item.end} onChange={(v) => upd({ end: v })} />
          <TextArea
            className="col-span-2"
            label={L.description}
            value={item.description}
            onChange={(v) => upd({ description: v })}
          />
        </div>
      )}
    />
  );
}

function SkillsSection() {
  const { data } = useCV();
  const L = ui[data.lang];
  const levels: SkillLevel[] = ["basic", "intermediate", "advanced", "expert"];
  return (
    <ListSection<Skill>
      keyName="skills"
      label={sectionTitle("skills", data.lang)}
      empty={() => ({ id: crypto.randomUUID(), name: "", level: "intermediate" })}
      render={(item, upd) => (
        <div className="grid grid-cols-2 gap-2">
          <Field label={L.name} value={item.name} onChange={(v) => upd({ name: v })} />
          <div>
            <Label className="text-xs font-medium mb-1 block">{L.level}</Label>
            <Select value={item.level} onValueChange={(v) => upd({ level: v as SkillLevel })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {levels.map((lv) => (
                  <SelectItem key={lv} value={lv}>
                    {ui[data.lang][lv as never] ?? lv}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    />
  );
}

function LanguagesSection() {
  const { data } = useCV();
  const L = ui[data.lang];
  return (
    <ListSection<Language>
      keyName="languages"
      label={sectionTitle("languages", data.lang)}
      empty={() => ({ id: crypto.randomUUID(), name: "", level: "" })}
      render={(item, upd) => (
        <div className="grid grid-cols-2 gap-2">
          <Field label={L.languageName} value={item.name} onChange={(v) => upd({ name: v })} />
          <Field label={L.languageLevel} value={item.level} onChange={(v) => upd({ level: v })} />
        </div>
      )}
    />
  );
}

function ReferencesSection() {
  const { data, set } = useCV();
  const L = ui[data.lang];
  return (
    <Panel value="references" title={sectionTitle("references", data.lang)}>
      <label className="flex items-center gap-2 text-sm mb-3">
        <Switch checked={data.showReferences} onCheckedChange={(c) => set("showReferences", c)} />
        {L.showReferences}
      </label>
      {data.showReferences && (
        <ListSectionInner<Reference>
          keyName="references"
          empty={() => ({ id: crypto.randomUUID(), name: "", company: "", phone: "" })}
          render={(item, upd) => (
            <div className="grid grid-cols-2 gap-2">
              <Field label={L.referenceName} value={item.name} onChange={(v) => upd({ name: v })} />
              <Field label={L.company} value={item.company} onChange={(v) => upd({ company: v })} />
              <Field label={L.phone} value={item.phone} onChange={(v) => upd({ phone: v })} />
            </div>
          )}
        />
      )}
    </Panel>
  );
}

// same as ListSection body but without wrapping Panel — for use inside ReferencesSection
function ListSectionInner<T extends { id: string }>({
  keyName,
  empty,
  render,
}: {
  keyName: keyof CVData & string;
  empty: () => T;
  render: (item: T, upd: (patch: Partial<T>) => void) => React.ReactNode;
}) {
  const { data, set } = useCV();
  const L = ui[data.lang];
  const items = data[keyName] as unknown as T[];
  const setItems = (next: T[]) => set(keyName as never, next as never);
  const upd = (id: string, patch: Partial<T>) =>
    setItems(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  const remove = (id: string) => setItems(items.filter((i) => i.id !== id));
  const add = () => setItems([...items, empty()]);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));
  const onEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldI = items.findIndex((i) => i.id === active.id);
    const newI = items.findIndex((i) => i.id === over.id);
    setItems(arrayMove(items, oldI, newI));
  };
  return (
    <div className="space-y-2">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onEnd}>
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          {items.map((item) => (
            <SortableRow key={item.id} id={item.id} onRemove={() => remove(item.id)}>
              {render(item, (patch) => upd(item.id, patch))}
            </SortableRow>
          ))}
        </SortableContext>
      </DndContext>
      <Button type="button" variant="outline" size="sm" onClick={add} className="w-full">
        <Plus className="w-4 h-4 mr-1" /> {L.add}
      </Button>
    </div>
  );
}

// ---------- Customize (theme, font, colors, photo, layout, sections) ----------

function CustomizeSection() {
  const { data, set } = useCV();
  const L = ui[data.lang];
  const SECTION_KEYS: SectionKey[] = [
    "profile",
    "experience",
    "education",
    "skills",
    "languages",
    "projects",
    "courses",
    "certifications",
    "volunteer",
    "objectives",
    "additional",
    "references",
  ];

  return (
    <Panel value="customize" title={L.customize}>
      <div className="space-y-4">
        <div>
          <Label className="text-xs font-medium mb-2 block">{L.theme}</Label>
          <div className="grid grid-cols-4 gap-2">
            {THEMES.map((th) => (
              <button
                key={th.id}
                type="button"
                onClick={() => set("theme", th.id)}
                className={`rounded-md border-2 p-2 text-left transition ${
                  data.theme === th.id ? "border-primary" : "border-transparent hover:border-muted"
                }`}
                title={th.name}
              >
                <div className="h-10 rounded flex overflow-hidden">
                  <div style={{ background: th.sidebarBg }} className="w-1/3" />
                  <div style={{ background: th.bg }} className="w-2/3 flex items-center justify-center">
                    <div style={{ background: th.primary }} className="w-6 h-1 rounded" />
                  </div>
                </div>
                <div className="text-[10px] mt-1 truncate">{th.name}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs font-medium mb-1 block">{L.font}</Label>
            <Select value={data.font} onValueChange={(v) => set("font", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONTS.map((f) => (
                  <SelectItem key={f} value={f}>
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs font-medium mb-1 block">{L.layout}</Label>
            <Select value={data.layout} onValueChange={(v) => set("layout", v as LayoutKind)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="one-col">{L.oneCol}</SelectItem>
                <SelectItem value="two-col">{L.twoCol}</SelectItem>
                <SelectItem value="sidebar-left">{L.sidebarLeft}</SelectItem>
                <SelectItem value="sidebar-right">{L.sidebarRight}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs font-medium mb-1 block">{L.primaryColor}</Label>
            <input
              type="color"
              className="w-full h-9 rounded border cursor-pointer"
              value={data.primaryColor || THEMES.find((t) => t.id === data.theme)!.primary}
              onChange={(e) => set("primaryColor", e.target.value)}
            />
          </div>
          <div>
            <Label className="text-xs font-medium mb-1 block">{L.secondaryColor}</Label>
            <input
              type="color"
              className="w-full h-9 rounded border cursor-pointer"
              value={data.secondaryColor || THEMES.find((t) => t.id === data.theme)!.secondary}
              onChange={(e) => set("secondaryColor", e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex items-center gap-2 text-sm">
            <Switch checked={data.showPhoto} onCheckedChange={(c) => set("showPhoto", c)} />
            {L.showPhoto}
          </label>
          <div>
            <Label className="text-xs font-medium mb-1 block">{L.photoShape}</Label>
            <Select value={data.photoShape} onValueChange={(v) => set("photoShape", v as PhotoShape)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="round">{L.round}</SelectItem>
                <SelectItem value="square">{L.square}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label className="text-xs font-medium mb-2 block">{L.sections}</Label>
          <div className="grid grid-cols-2 gap-1.5">
            {SECTION_KEYS.map((k) => (
              <label key={k} className="flex items-center gap-2 text-sm">
                <Switch
                  checked={data.sectionsVisible[k]}
                  onCheckedChange={(c) =>
                    set("sectionsVisible", { ...data.sectionsVisible, [k]: c })
                  }
                />
                {sectionTitle(k, data.lang)}
              </label>
            ))}
          </div>
        </div>
      </div>
    </Panel>
  );
}

function ReorderSection() {
  const { data, set } = useCV();
  const L = ui[data.lang];
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));
  const onEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldI = data.sectionsOrder.indexOf(active.id as SectionKey);
    const newI = data.sectionsOrder.indexOf(over.id as SectionKey);
    set("sectionsOrder", arrayMove(data.sectionsOrder, oldI, newI));
  };
  return (
    <Panel value="reorder" title={L.reorderSections}>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onEnd}>
        <SortableContext items={data.sectionsOrder} strategy={verticalListSortingStrategy}>
          <div className="space-y-1.5">
            {data.sectionsOrder.map((k) => (
              <ReorderRow key={k} id={k} label={sectionTitle(k, data.lang)} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </Panel>
  );
}

function ReorderRow({ id, label }: { id: SectionKey; label: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.6 : 1 }}
      className="flex items-center gap-2 border rounded-md px-2 py-1.5 bg-background text-sm"
    >
      <button
        type="button"
        className="p-1 text-muted-foreground hover:text-foreground cursor-grab touch-none"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-4 h-4" />
      </button>
      {label}
    </div>
  );
}
