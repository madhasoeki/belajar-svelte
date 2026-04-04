<script lang="ts">
  import Button from "$lib/components/ui/button/Button.svelte";
  
  // Menerima komponen Icon dari Lucide secara dinamis
  let { 
    icon: Icon, 
    onclick, 
    ariaLabel = "Action",
    class: className = ""
  } = $props();
</script>

<div class="md:hidden fixed bottom-24 right-6 z-50 {className}">
  <Button 
    variant="primary" 
    class="h-14 w-14 p-0! flex items-center justify-center rounded-full! shadow-lg shadow-(--color-primary)/30 transition-transform active:scale-95"
    aria-label={ariaLabel}
    {onclick}
  >
    <Icon size={24} />
  </Button>
</div>