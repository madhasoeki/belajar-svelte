<script>
  import Card from "$lib/components/ui/card/Card.svelte";
  import CardDescription from "$lib/components/ui/card/CardDescription.svelte";
  import CardHeader from "$lib/components/ui/card/CardHeader.svelte";
  import CardTitle from "$lib/components/ui/card/CardTitle.svelte";
  import CardContent from "$lib/components/ui/card/CardContent.svelte";
  import CardFooter from "$lib/components/ui/card/CardFooter.svelte";

</script>
<Card>
  {#snippet children()}
    <CardHeader>
      <CardTitle>Total Users</CardTitle>
      <CardDescription>Last 30 days</CardDescription>
    </CardHeader>

    <CardContent>
      <p class="text-3xl font-bold">1,245</p>
    </CardContent>

    <CardFooter>
      <p class="text-sm text-gray-500">Updated just now</p>
    </CardFooter>
  {/snippet}
</Card>