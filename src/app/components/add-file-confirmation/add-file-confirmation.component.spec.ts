import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddFileConfirmationComponent } from './add-file-confirmation.component';
import { By } from '@angular/platform-browser';

describe('AddFileConfirmationComponent', () => {
  let component: AddFileConfirmationComponent;
  let fixture: ComponentFixture<AddFileConfirmationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddFileConfirmationComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(AddFileConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render file summary', () => {
    component.fileSummary = [
      { label: 'תיאור תהליך', value: 'בדיקה' },
      { label: 'סוג קליטה', value: 'טעינה בלבד' }
    ];
    fixture.detectChanges();
    const labels = fixture.debugElement.queryAll(By.css('.preview-label'));
    expect(labels.length).toBe(2);
    expect(labels[0].nativeElement.textContent).toContain('תיאור תהליך');
  });

  it('should emit back event', () => {
    spyOn(component.back, 'emit');
    const btn = fixture.debugElement.query(By.css('.btn-secondary'));
    btn.triggerEventHandler('click', null);
    expect(component.back.emit).toHaveBeenCalled();
  });

  it('should emit create event', () => {
    spyOn(component.create, 'emit');
    const btn = fixture.debugElement.query(By.css('.btn-primary'));
    btn.triggerEventHandler('click', null);
    expect(component.create.emit).toHaveBeenCalled();
  });
});
