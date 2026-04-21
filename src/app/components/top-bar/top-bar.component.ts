import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface DebugBarSettingsViewModel {
  showDebugBar: boolean;
  textSizeMultiplier: number;
  leftPanelWidth: string;
  bottomBarHeight: string;
  descriptionAutoScrollPixelsPerSecond: number;
}

export type DebugBarSettingKey = keyof DebugBarSettingsViewModel;

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './top-bar.component.html',
  styleUrl: './top-bar.component.css',
})
export class TopBarComponent {
  @Input({ required: true }) settings!: DebugBarSettingsViewModel;
  @Output() refresh = new EventEmitter<void>();
  @Output() settingChanged = new EventEmitter<{
    key: DebugBarSettingKey;
    value: string | number | boolean;
  }>();

  onRefresh(): void {
    this.refresh.emit();
  }

  updateSetting(key: DebugBarSettingKey, value: string | number | boolean): void {
    this.settingChanged.emit({ key, value });
  }
}
