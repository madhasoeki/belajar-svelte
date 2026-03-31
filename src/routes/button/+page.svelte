<script>
  import Button from "$lib/components/ui/button/Button.svelte";
  import { Plus, ArrowRight, Trash } from "lucide-svelte";

</script>
<Button>
  Button biasa
</Button>

<Button variant="primary">
  Button Primary
</Button>

<Button variant="secondary">
  Button Secondary
</Button>

<Button variant="danger">
  Button Danger
</Button>

<Button variant="ghost">
  Button Ghost
</Button>

<Button icon={Plus}>
  Tambah Data
</Button>

<Button icon={Trash} variant="danger">
</Button>

<Button icon={ArrowRight} iconPosition="right">
  Lanjut
</Button>

<Button size="sm">Small</Button>

<Button size="md">Medium</Button>

<Button size="lg">Large</Button>

<Button variant="outline">
  Export
</Button>