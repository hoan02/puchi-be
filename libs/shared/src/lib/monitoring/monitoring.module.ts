import { Module, Global } from '@nestjs/common';
import { ServiceRegistryProvider } from '../providers';

@Global()
@Module({
  providers: [ServiceRegistryProvider],
  exports: [ServiceRegistryProvider],
})
export class MonitoringModule { } 