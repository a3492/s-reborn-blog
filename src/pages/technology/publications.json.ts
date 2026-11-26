import type {APIRoute} from 'astro';
import registry from '../../data/technology-registry.json';
import manifest from '../../data/publications.json';
import {validatePublications} from '../../data/publication-policy.mjs';
export const GET:APIRoute=()=>new Response(JSON.stringify({version:manifest.version,records:validatePublications(manifest,registry)}),{headers:{'Content-Type':'application/json; charset=utf-8'}});