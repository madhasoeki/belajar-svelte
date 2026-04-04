<script lang="ts">
  interface Option {
    label: string;
    value: string;
  }

  let { 
    options = [], 
    selected = $bindable(), 
    class: className = "" 
  }: {
    options: Option[];
    selected: string;
    class?: string;
  } = $props();
</script>

<div class="flex items-center bg-gray-100 p-1 rounded-lg h-10 w-full md:w-auto shrink-0 {className}">
  {#each options as option}
    <button 
      type="button"
      onclick={() => selected = option.value}
      class={`flex-1 md:flex-none h-full px-5 flex items-center justify-center text-sm font-medium rounded-md transition-all duration-200 focus:outline-none ${
        selected === option.value 
          ? 'bg-white text-gray-900 shadow-sm' 
          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
      }`}
    >
      {option.label}
    </button>
  {/each}
</div>