<script>
  import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
  } from "$lib/components/ui/card";
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

<Card variant="success" class="mt-5">
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

<Card variant="warning" class="mt-5">
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

<Card variant="danger" class="mt-5">
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