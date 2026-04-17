import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TeamCityBuild } from '../../models/teamcity.models';

@Component({
  selector: 'app-bottom-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bottom-bar.component.html',
  styleUrl: './bottom-bar.component.css',
})
export class BottomBarComponent {
  @Input() builds: TeamCityBuild[] = [];
  private readonly swedishDateTimeFormatter = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Stockholm',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  trackBuild(index: number, build: TeamCityBuild): string {
    return `${build.id}:${build.label ?? 'default'}:${index}`;
  }

  formatBranchName(branchName?: string): string {
    return branchName || 'Unknown branch';
  }

  isBuildSuccessful(status: string): boolean {
    return status === 'SUCCESS';
  }

  formatStatus(status: string): string {
    return this.isBuildSuccessful(status) ? 'Success' : 'Not successful';
  }

  formatFinishDate(finishDate?: string): string {
    if (!finishDate) {
      return 'No finish date';
    }

    const match = finishDate.match(
      /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})([+-])(\d{2})(\d{2})$/,
    );

    if (!match) {
      return finishDate;
    }

    const [, year, month, day, hours, minutes, seconds, sign, offsetHours, offsetMinutes] = match;
    const normalizedOffset = `${sign}${offsetHours}:${offsetMinutes}`;
    const date = new Date(
      `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${normalizedOffset}`,
    );

    if (Number.isNaN(date.getTime())) {
      return finishDate;
    }

    return `${this.swedishDateTimeFormatter.format(date)} SWE`;
  }
}
