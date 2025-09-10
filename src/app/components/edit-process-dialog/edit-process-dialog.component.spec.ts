import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditProcessDialogComponent } from './edit-process-dialog.component';
import { FormsModule } from '@angular/forms';

describe('EditProcessDialogComponent', () => {
  let component: EditProcessDialogComponent;
  let fixture: ComponentFixture<EditProcessDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [EditProcessDialogComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditProcessDialogComponent);
    component = fixture.componentInstance;
    component.visible = true;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show errors for invalid input', () => {
    component.data = {
      importDataSourceDesc: '',
      systemId: '',
      jobName: '',
      urlFile: '',
      urlFileAfterProcess: '',
      errorRecipients: '',
      startDate: '',
      endDate: ''
    };
    expect(component.validate()).toBeFalse();
    expect(Object.keys(component.errors).length).toBeGreaterThan(0);
  });

  it('should emit confirm event with valid data', () => {
    spyOn(component.confirm, 'emit');
    component.data = {
      importDataSourceDesc: 'תיאור',
      systemId: 'HR_SYSTEM',
      jobName: 'Job1',
      urlFile: '/data/file.csv',
      urlFileAfterProcess: '/data/processed.csv',
      errorRecipients: 'a@b.com',
      startDate: '2025-01-01',
      endDate: '2025-12-31'
    };
    component.onConfirm();
    expect(component.confirm.emit).toHaveBeenCalledWith(component.data);
  });

  it('should emit cancel event', () => {
    spyOn(component.cancel, 'emit');
    component.onCancel();
    expect(component.cancel.emit).toHaveBeenCalled();
  });
});
