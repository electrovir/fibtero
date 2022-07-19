import {MainRendererPage} from '@packages/common/src/data/main-renderer-page';
import {defineTypedEvent} from 'element-vir';

export const ChangePageEvent = defineTypedEvent<MainRendererPage>()('change-page');
