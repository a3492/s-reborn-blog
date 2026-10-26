import registry from '../../data/research-registry.json';
import { type ResearchDocument, validateAndBuild } from './tree';

export function loadResearchTree() {
	return validateAndBuild(registry.documents as ResearchDocument[]);
}
