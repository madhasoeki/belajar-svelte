import { redirect } from '@sveltejs/kit';
import { ROUTES } from '$lib/constans/routes';

export function load() {
  redirect(307, ROUTES.DASHBOARD);
}