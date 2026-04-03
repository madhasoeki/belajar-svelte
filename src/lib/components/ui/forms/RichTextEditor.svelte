<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { fade, slide } from "svelte/transition";
  import { Editor } from "@tiptap/core";
  import StarterKit from "@tiptap/starter-kit";
  import Underline from "@tiptap/extension-underline";
  import TextAlign from "@tiptap/extension-text-align";
  import Link from "@tiptap/extension-link";
  import Placeholder from "@tiptap/extension-placeholder";
  import ImageExtension from "@tiptap/extension-image";
  import { TextStyle } from "@tiptap/extension-text-style";
  import { Color } from "@tiptap/extension-color";
  import FontFamily from "@tiptap/extension-font-family";
  import Highlight from "@tiptap/extension-highlight";
  import Subscript from "@tiptap/extension-subscript";
  import Superscript from "@tiptap/extension-superscript";
  
  import { 
    Bold, Italic, Underline as UnderlineIcon, Strikethrough, 
    List, ListOrdered, Heading1, Heading2, Heading3, Heading4, Heading5, Heading6, Quote, 
    Undo, Redo, AlignLeft, AlignCenter, AlignRight, AlignJustify,
    Link as LinkIcon, Trash2, Type, Image as ImageIcon, Palette,
    Subscript as SubIcon, Superscript as SupIcon, Minus,
    X, Check, Smile, ChevronDown
  } from "lucide-svelte";

  interface RichTextProps {
    value?: string;
    label?: string;
    placeholder?: string;
    error?: string;
    class?: string;
  }

  let {
    value = $bindable(""),
    label = "",
    placeholder = "Tulis laporan atau deskripsi di sini...",
    error = "",
    class: className = ""
  }: RichTextProps = $props();

  let editorEl = $state<HTMLDivElement | null>(null);
  let editor = $state<Editor | null>(null);
  let editorId = `editor-${Math.random().toString(36).slice(2, 9)}`;

  let activeStates = $state({
    bold: false, italic: false, underline: false, strike: false,
    highlight: false, subscript: false, superscript: false,
    h1: false, h2: false, h3: false, h4: false, h5: false, h6: false,
    bulletList: false, orderedList: false, blockquote: false,
    left: true, center: false, right: false, justify: false,
    link: false, isImage: false,
    currentColor: "#000000", currentHighlight: "#fef08a", currentFont: "Inter"
  });

  // UI Popovers State
  let showLinkPopup = $state(false);
  let showColorPicker = $state(false);
  let showEmojiPicker = $state(false);
  
  let linkUrl = $state("");
  let linkInputRef = $state<HTMLInputElement | null>(null);
  let fileInputRef = $state<HTMLInputElement | null>(null);

  // Preset Data
  const presetColors = ["#000000", "#475569", "#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#a855f7", "#ec4899", "#ffffff"];
  const presetEmojis = ["😀","😂","🥰","😎","🤔","🙏","👍","👎","🔥","✨","🎉","❤️","💡","✅","❌"];
  const fontFamilies = [
    { name: "Inter", value: "Inter, sans-serif" },
    { name: "Serif", value: "Georgia, serif" },
    { name: "Mono", value: "monospace" }
  ];

  onMount(() => {
    if (!editorEl) return;

    editor = new Editor({
      element: editorEl,
      extensions: [
        StarterKit.configure({ codeBlock: false }),
        Underline, TextStyle, Color, FontFamily,
        Highlight.configure({ multicolor: true }),
        Subscript, Superscript,
        ImageExtension.configure({
          inline: true,
          HTMLAttributes: { class: 'rounded-lg border border-gray-200 shadow-sm transition-all duration-200 my-4' }
        }),
        TextAlign.configure({ types: ["heading", "paragraph"] }),
        Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-(--color-primary) cursor-pointer underline' } }),
        Placeholder.configure({ placeholder })
      ],
      content: value,
      editorProps: {
        attributes: {
          id: editorId,
          class: "editor-content focus:outline-none min-h-[250px] p-5 text-(--color-text-primary)",
        },
      },
      onUpdate: ({ editor }) => { value = editor.getHTML(); },
      onTransaction: ({ editor }) => {
        activeStates.bold = editor.isActive("bold");
        activeStates.italic = editor.isActive("italic");
        activeStates.underline = editor.isActive("underline");
        activeStates.strike = editor.isActive("strike");
        activeStates.highlight = editor.isActive("highlight");
        activeStates.subscript = editor.isActive("subscript");
        activeStates.superscript = editor.isActive("superscript");
        
        activeStates.h1 = editor.isActive("heading", { level: 1 });
        activeStates.h2 = editor.isActive("heading", { level: 2 });
        activeStates.h3 = editor.isActive("heading", { level: 3 });
        activeStates.h4 = editor.isActive("heading", { level: 4 });
        activeStates.h5 = editor.isActive("heading", { level: 5 });
        activeStates.h6 = editor.isActive("heading", { level: 6 });
        
        activeStates.bulletList = editor.isActive("bulletList");
        activeStates.orderedList = editor.isActive("orderedList");
        activeStates.blockquote = editor.isActive("blockquote");
        
        activeStates.left = editor.isActive({ textAlign: "left" });
        activeStates.center = editor.isActive({ textAlign: "center" });
        activeStates.right = editor.isActive({ textAlign: "right" });
        activeStates.justify = editor.isActive({ textAlign: "justify" });
        
        activeStates.link = editor.isActive("link");
        activeStates.isImage = editor.isActive("image");
        activeStates.currentColor = editor.getAttributes('textStyle').color || "#000000";
        activeStates.currentHighlight = editor.getAttributes('highlight').color || "#fef08a";
      },
    });
  });

  onDestroy(() => { editor?.destroy(); });

  function toggleLinkPopup() {
    closeAllPopups();
    if (activeStates.link) { editor?.chain().focus().unsetLink().run(); return; }
    showLinkPopup = true;
    setTimeout(() => linkInputRef?.focus(), 50);
  }

  function applyCustomLink() {
    if (linkUrl) {
      const validUrl = /^https?:\/\//.test(linkUrl) ? linkUrl : `https://${linkUrl}`;
      editor?.chain().focus().extendMarkRange('link').setLink({ href: validUrl }).run();
    }
    showLinkPopup = false;
  }

  function handleImageUpload(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        editor?.chain().focus().setImage({ src: result }).updateAttributes('image', { style: 'width: 100%' }).run();
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef) fileInputRef.value = '';
  }

  function resizeImage(percentage: string) {
    if (editor?.isActive('image')) {
      editor.chain().focus().updateAttributes('image', { style: `width: ${percentage}` }).run();
    }
  }

  function insertEmoji(emoji: string) {
    editor?.chain().focus().insertContent(emoji).run();
    showEmojiPicker = false;
  }

  function closeAllPopups() {
    showLinkPopup = false;
    showColorPicker = false;
    showEmojiPicker = false;
  }

  function toggleColorPicker() {
    const isCurrentlyOpen = showColorPicker;
    closeAllPopups();
    showColorPicker = !isCurrentlyOpen;
  }

  function toggleEmojiPicker() {
    const isCurrentlyOpen = showEmojiPicker;
    closeAllPopups();
    showEmojiPicker = !isCurrentlyOpen;
  }

  function getBtnClass(isActive: boolean) {
    return `p-1.5 rounded-md transition-all ${
      isActive ? "bg-(--color-primary-soft) text-(--color-primary) shadow-sm" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
    }`;
  }
</script>

<div class={`flex flex-col gap-1.5 ${className}`}>
  {#if label}
    <label for={editorId} class="text-sm font-semibold text-(--color-text-primary)">{label}</label>
  {/if}

  <div class={`relative flex flex-col bg-white border rounded-xl overflow-visible shadow-sm transition-all focus-within:ring-2 focus-within:ring-(--color-primary-soft) focus-within:border-(--color-primary)
    ${error ? 'border-red-500' : 'border-(--color-border)'}
  `}>
    
    {#if editor}
      <div class="flex flex-wrap items-center gap-0.5 p-2 border-b border-gray-100 bg-gray-50/50 rounded-t-xl relative z-10">
        
        <div class="relative">
          <select 
            aria-label="Pilih Font"
            onchange={(e) => editor?.chain().focus().setFontFamily(e.currentTarget.value).run()}
            class="appearance-none bg-transparent hover:bg-gray-100 text-sm font-medium text-gray-700 py-1.5 pl-2 pr-6 rounded-md cursor-pointer focus:outline-none"
          >
            {#each fontFamilies as font}
              <option value={font.value}>{font.name}</option>
            {/each}
          </select>
          <ChevronDown size={12} class="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
        </div>
        <div class="w-px h-5 bg-gray-300 mx-1"></div>

        <button type="button" onclick={() => editor?.chain().focus().setParagraph().run()} class={getBtnClass(!activeStates.h1 && !activeStates.h2 && !activeStates.h3 && !activeStates.h4 && !activeStates.h5 && !activeStates.h6 && !activeStates.bulletList && !activeStates.orderedList && !activeStates.blockquote)} title="Paragraph" aria-label="Paragraph"><Type size={16} /></button>
        <button type="button" onclick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} class={getBtnClass(activeStates.h1)} title="Heading 1" aria-label="Heading 1"><Heading1 size={16} /></button>
        <button type="button" onclick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} class={getBtnClass(activeStates.h2)} title="Heading 2" aria-label="Heading 2"><Heading2 size={16} /></button>
        <button type="button" onclick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} class={getBtnClass(activeStates.h3)} title="Heading 3" aria-label="Heading 3"><Heading3 size={16} /></button>
        <button type="button" onclick={() => editor?.chain().focus().toggleHeading({ level: 4 }).run()} class={getBtnClass(activeStates.h4)} title="Heading 4" aria-label="Heading 4"><Heading4 size={16} /></button>
        <div class="w-px h-5 bg-gray-300 mx-1"></div>

        <button type="button" onclick={() => editor?.chain().focus().toggleBold().run()} class={getBtnClass(activeStates.bold)} title="Bold" aria-label="Bold"><Bold size={16} /></button>
        <button type="button" onclick={() => editor?.chain().focus().toggleItalic().run()} class={getBtnClass(activeStates.italic)} title="Italic" aria-label="Italic"><Italic size={16} /></button>
        <button type="button" onclick={() => editor?.chain().focus().toggleUnderline().run()} class={getBtnClass(activeStates.underline)} title="Underline" aria-label="Underline"><UnderlineIcon size={16} /></button>
        <button type="button" onclick={() => editor?.chain().focus().toggleStrike().run()} class={getBtnClass(activeStates.strike)} title="Strike" aria-label="Strike"><Strikethrough size={16} /></button>
        <button type="button" onclick={() => editor?.chain().focus().toggleSubscript().run()} class={getBtnClass(activeStates.subscript)} title="Subscript" aria-label="Subscript"><SubIcon size={16} /></button>
        <button type="button" onclick={() => editor?.chain().focus().toggleSuperscript().run()} class={getBtnClass(activeStates.superscript)} title="Superscript" aria-label="Superscript"><SupIcon size={16} /></button>
        
        <div class="relative">
          <button type="button" onclick={toggleColorPicker} class={getBtnClass(showColorPicker)} title="Warna & Stabilo" aria-label="Pilih Warna">
            <Palette size={16} style="color: {activeStates.currentColor}" />
          </button>
          
          {#if showColorPicker}
            <div transition:fade={{ duration: 100 }} class="absolute top-full left-0 mt-1 bg-white border border-gray-200 shadow-xl rounded-lg p-3 z-50 w-48 flex flex-col gap-3">
              <div>
                <p class="text-[10px] font-bold text-gray-400 uppercase mb-1.5">Warna Teks</p>
                <div class="flex flex-wrap gap-1">
                  {#each presetColors as color}
                    <button type="button" aria-label="Warna {color}" onclick={() => { editor?.chain().focus().setColor(color).run(); showColorPicker = false; }} class="w-5 h-5 rounded border border-gray-200 hover:scale-110 transition-transform" style="background-color: {color};"></button>
                  {/each}
                </div>
              </div>
              <div>
                <p class="text-[10px] font-bold text-gray-400 uppercase mb-1.5">Warna Stabilo</p>
                <div class="flex flex-wrap gap-1">
                  <button type="button" aria-label="Hapus Stabilo" title="Hapus Warna" onclick={() => { editor?.chain().focus().unsetHighlight().run(); showColorPicker = false; }} class="w-5 h-5 flex items-center justify-center rounded border border-gray-200 text-gray-400 hover:bg-gray-100"><X size={12}/></button>
                  {#each ['#fef08a', '#fbcfe8', '#bfdbfe', '#bbf7d0', '#fed7aa'] as color}
                    <button type="button" aria-label="Stabilo {color}" onclick={() => { editor?.chain().focus().toggleHighlight({ color }).run(); showColorPicker = false; }} class="w-5 h-5 rounded border border-gray-200 hover:scale-110 transition-transform" style="background-color: {color};"></button>
                  {/each}
                </div>
              </div>
            </div>
          {/if}
        </div>
        <div class="w-px h-5 bg-gray-300 mx-1"></div>

        <button type="button" onclick={() => editor?.chain().focus().setTextAlign('left').run()} class={getBtnClass(activeStates.left)} title="Align Left" aria-label="Align Left"><AlignLeft size={16} /></button>
        <button type="button" onclick={() => editor?.chain().focus().setTextAlign('center').run()} class={getBtnClass(activeStates.center)} title="Align Center" aria-label="Align Center"><AlignCenter size={16} /></button>
        <button type="button" onclick={() => editor?.chain().focus().setTextAlign('right').run()} class={getBtnClass(activeStates.right)} title="Align Right" aria-label="Align Right"><AlignRight size={16} /></button>
        <button type="button" onclick={() => editor?.chain().focus().setTextAlign('justify').run()} class={getBtnClass(activeStates.justify)} title="Justify" aria-label="Justify"><AlignJustify size={16} /></button>
        <div class="w-px h-5 bg-gray-300 mx-1"></div>

        <button type="button" onclick={() => editor?.chain().focus().toggleBulletList().run()} class={getBtnClass(activeStates.bulletList)} title="Bullet List" aria-label="Bullet List"><List size={16} /></button>
        <button type="button" onclick={() => editor?.chain().focus().toggleOrderedList().run()} class={getBtnClass(activeStates.orderedList)} title="Ordered List" aria-label="Ordered List"><ListOrdered size={16} /></button>
        <button type="button" onclick={() => editor?.chain().focus().toggleBlockquote().run()} class={getBtnClass(activeStates.blockquote)} title="Quote" aria-label="Quote"><Quote size={16} /></button>
        <button type="button" onclick={() => editor?.chain().focus().setHorizontalRule().run()} class="p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 rounded-md" title="Horizontal Line" aria-label="Horizontal Line"><Minus size={16} /></button>
        <div class="w-px h-5 bg-gray-300 mx-1"></div>

        <button type="button" onclick={toggleLinkPopup} class={getBtnClass(activeStates.link)} title="Add/Remove Link" aria-label="Toggle Link"><LinkIcon size={16} /></button>
        
        <button type="button" onclick={() => { closeAllPopups(); fileInputRef?.click(); }} class="p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 rounded-md" title="Insert Image" aria-label="Insert Image"><ImageIcon size={16} /></button>
        <input bind:this={fileInputRef} type="file" accept="image/*" aria-label="Upload Image" class="hidden" onchange={handleImageUpload} />

        <div class="relative">
          <button type="button" onclick={toggleEmojiPicker} class={getBtnClass(showEmojiPicker)} title="Insert Emoji" aria-label="Insert Emoji"><Smile size={16} /></button>
          {#if showEmojiPicker}
            <div transition:fade={{ duration: 100 }} class="absolute top-full right-0 mt-1 bg-white border border-gray-200 shadow-xl rounded-lg p-2 z-50 w-44 grid grid-cols-5 gap-1">
              {#each presetEmojis as emoji}
                <button type="button" aria-label="Emoji {emoji}" onclick={() => insertEmoji(emoji)} class="text-xl hover:bg-gray-100 rounded p-1 transition-colors">{emoji}</button>
              {/each}
            </div>
          {/if}
        </div>

        <div class="ml-auto flex items-center gap-0.5">
          <button type="button" onclick={() => editor?.chain().focus().unsetAllMarks().clearNodes().run()} class="p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-md" title="Clear Formatting" aria-label="Clear Formatting"><Trash2 size={16} /></button>
          <button type="button" onclick={() => editor?.chain().focus().undo().run()} disabled={!editor.can().undo()} class="p-1.5 disabled:opacity-20" title="Undo" aria-label="Undo"><Undo size={16} /></button>
          <button type="button" onclick={() => editor?.chain().focus().redo().run()} disabled={!editor.can().redo()} class="p-1.5 disabled:opacity-20" title="Redo" aria-label="Redo"><Redo size={16} /></button>
        </div>
      </div>

      {#if activeStates.isImage}
        <div transition:fade={{duration: 100}} class="bg-(--color-primary) text-white text-xs px-2 py-1 flex gap-2 justify-center w-full z-10 shadow-inner">
          <span class="font-medium flex items-center mr-2">Resize Gambar:</span>
          <button type="button" aria-label="Resize 25%" onclick={() => resizeImage('25%')} class="hover:bg-white/20 px-2 rounded transition-colors">Kecil (25%)</button>
          <button type="button" aria-label="Resize 50%" onclick={() => resizeImage('50%')} class="hover:bg-white/20 px-2 rounded transition-colors">Sedang (50%)</button>
          <button type="button" aria-label="Resize 100%" onclick={() => resizeImage('100%')} class="hover:bg-white/20 px-2 rounded transition-colors">Penuh (100%)</button>
        </div>
      {/if}

      {#if showLinkPopup}
        <div transition:slide={{ duration: 150 }} class="bg-gray-50 border-b border-gray-100 p-2 flex items-center gap-2 relative z-0">
          <input aria-label="URL Link" bind:this={linkInputRef} bind:value={linkUrl} onkeydown={(e) => e.key === 'Enter' && applyCustomLink()} type="url" placeholder="https://example.com" class="flex-1 text-sm px-3 py-1.5 bg-white border border-gray-200 rounded-md focus:outline-none focus:border-(--color-primary) focus:ring-1 focus:ring-(--color-primary)" />
          <button type="button" aria-label="Terapkan Link" title="Terapkan" onclick={applyCustomLink} class="p-1.5 bg-(--color-primary) text-white rounded-md hover:bg-(--color-primary-hover) transition-colors"><Check size={16} /></button>
          <button type="button" aria-label="Batal Link" title="Batal" onclick={() => showLinkPopup = false} class="p-1.5 bg-white border border-gray-200 text-gray-500 rounded-md hover:bg-gray-100 transition-colors"><X size={16} /></button>
        </div>
      {/if}
    {/if}

    <div bind:this={editorEl}></div>
  </div>

  {#if error}
    <p class="text-xs text-red-500 mt-0.5">{error}</p>
  {/if}
</div>

<style>
  :global(.editor-content) { font-family: inherit; }
  :global(.editor-content h1) { font-size: 2.25rem; font-weight: 800; margin: 1rem 0 1rem 0; line-height: 1.2; }
  :global(.editor-content h2) { font-size: 1.875rem; font-weight: 700; margin: 1rem 0 0.75rem 0; line-height: 1.3; }
  :global(.editor-content h3) { font-size: 1.5rem; font-weight: 600; margin: 1rem 0 0.5rem 0; line-height: 1.4; }
  :global(.editor-content h4) { font-size: 1.25rem; font-weight: 600; margin: 0.75rem 0 0.5rem 0; line-height: 1.5; }
  :global(.editor-content h5) { font-size: 1.125rem; font-weight: 600; margin: 0.75rem 0 0.5rem 0; line-height: 1.5; }
  :global(.editor-content h6) { font-size: 1rem; font-weight: 600; margin: 0.75rem 0 0.5rem 0; line-height: 1.5; color: #475569; text-transform: uppercase; letter-spacing: 0.05em; }
  
  :global(.editor-content ul) { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1rem; }
  :global(.editor-content ol) { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 1rem; }
  :global(.editor-content blockquote) { border-left: 4px solid var(--color-primary); padding-left: 1rem; font-style: italic; margin: 1.5rem 0; color: #4b5563; background: #f9fafb; padding: 1rem; border-radius: 0 0.5rem 0.5rem 0; }
  :global(.editor-content p) { margin-bottom: 0.75rem; line-height: 1.6; }
  
  :global(.editor-content a) { color: var(--color-primary); text-decoration: underline; cursor: pointer; }
  :global(.editor-content img) { display: block; margin: 1.5rem auto; }
  :global(.editor-content hr) { border: 0; border-top: 2px solid #e5e7eb; margin: 2rem 0; }
  :global(.editor-content mark) { padding: 0.1rem 0.2rem; border-radius: 0.125rem; }

  :global(.editor-content p.is-editor-empty:first-child::before) {
    color: #9ca3af;
    float: left;
    height: 0;
    pointer-events: none;
    content: attr(data-placeholder);
  }
</style>