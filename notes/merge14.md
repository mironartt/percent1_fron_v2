# Merge 14: Bidirectional Synchronization Between Calendar and Goals Block

**Date:** December 3, 2025  
**Branch:** back_integration  
**File:** `src/views/Planning.vue`

## Overview

Implemented complete bidirectional synchronization between the weekly calendar and the "Goals and Steps" block in the Planning module. Any changes made in one block are now immediately reflected in the other.

## Problem Statement

Before this update:
- Changes in the calendar (completion status, date changes) were not reflected in the Goals block
- Changes in the Goals block (completion, date, priority, time) were not reflected in the calendar
- Users had to refresh the page to see consistent data across both views

## Solution Architecture

### Core Sync Functions

#### 1. `syncStepToCalendar(goalId, stepId, changes)`
Updates step data in `weeklyStepsData` (calendar view).
- Converts frontend format to backend format
- Handles: `completed`, `date`, `priority`, `timeEstimate`

```javascript
// Calendar uses backend format:
// - step_priority: 'important', 'desirable', 'attention', 'optional'
// - step_time_duration: 'half', 'one', 'two', 'three', 'four'
```

#### 2. `syncStepToGoalsBlock(goalId, stepId, changes)`
Updates step data in `store.goals` (goals block view).
- Converts backend format to frontend format
- Handles: `completed`, `date`, `priority`, `timeEstimate`

```javascript
// Goals block uses frontend format:
// - priority: 'critical', 'desirable', 'attention', 'optional'
// - timeEstimate: '30min', '1h', '2h', '3h', '4h'
```

#### 3. `refreshGoalsAfterCalendarChange()`
Synchronous reload of goals from backend after calendar changes.
- Calls `store.loadGoalsFromBackend()` with current filters
- Updates goal headers (counts, percentages)

### Priority Mapping

```javascript
// Backend → Frontend
const priorityBackendToFrontend = {
  'important': 'critical',
  'desirable': 'desirable',
  'attention': 'attention',
  'optional': 'optional'
}

// Frontend → Backend
const priorityFrontendToBackend = {
  'critical': 'important',
  'desirable': 'desirable',
  'attention': 'attention',
  'optional': 'optional'
}
```

### Time Duration Mapping

```javascript
// Backend → Frontend
const timeDurationMap = {
  'half': '30min',
  'one': '1h',
  'two': '2h',
  'three': '3h',
  'four': '4h'
}

// Frontend → Backend (used in sync functions)
const timeToBackend = {
  '30min': 'half',
  '1h': 'one',
  '2h': 'two',
  '3h': 'three',
  '4h': 'four'
}
```

## Sync Flows

### Calendar → Goals Block

#### 1. Drag Step to Different Day (`updateTaskDateWithBackend`)
```
User drags step from Monday to Wednesday
  ↓
1. Send API: updateGoalSteps({ dt: newDate })
  ↓
2. syncStepToGoalsBlock(goalId, stepId, { date: newDate })
  ↓
3. refreshGoalsAfterCalendarChange()
  ↓
4. loadWeeklySteps()
```

#### 2. Remove Step from Calendar (`removeTask`)
```
User clicks "×" on calendar task
  ↓
1. Send API: updateGoalSteps({ dt: '1700-01-01' })
  ↓
2. syncStepToGoalsBlock(goalId, stepId, { date: null })
  ↓
3. refreshGoalsAfterCalendarChange()
  ↓
4. loadWeeklySteps()
```

#### 3. Toggle Completion in Calendar (`toggleTaskComplete`)
```
User checks/unchecks task in calendar
  ↓
1. Send API: updateGoalSteps({ is_complete: newStatus })
  ↓
2. syncStepToCalendar() - local update
  ↓
3. syncStepToGoalsBlock() - update goals block
  ↓
4. refreshGoalsAfterCalendarChange()
  ↓
5. loadWeeklySteps()
```

### Goals Block → Calendar

#### 1. Toggle Step Completion (`toggleStepComplete`)
```
User checks/unchecks step in goals block
  ↓
1. store.updateGoalStep() - local update
  ↓
2. XP logic (award/revoke)
  ↓
3. Send API: updateGoalSteps({ is_complete: newStatus })
  ↓
4. syncStepToCalendar(goalId, stepId, { completed: newStatus })
  ↓
5. loadWeeklySteps()
```

#### 2. Change Step Date (`scheduleStep`)
```
User selects date in goals block
  ↓
1. Update local scheduledTasks
  ↓
2. Send API: updateGoalSteps({ dt: dateStr || '1700-01-01' })
  ↓
3. syncStepToCalendar() - if date set
  ↓
4. loadWeeklySteps()
```

#### 3. Change Priority/Time (`updateScheduledStep`)
```
User selects priority or time in goals block
  ↓
1. Update local scheduledTasks
  ↓
2. Convert to backend format:
   - priority: priorityFrontendToBackend[value]
   - time: timeToBackend[value]
  ↓
3. Send API: updateGoalSteps({ priority/time_duration })
  ↓
4. syncStepToCalendar(goalId, stepId, syncChanges)
  ↓
5. loadWeeklySteps()
```

#### 4. Drag Step to Calendar (`scheduleStepWithBackend`)
```
User drags step from goals block to calendar day
  ↓
1. Resolve backend IDs
  ↓
2. Send API: updateGoalSteps({ dt: dateStr })
  ↓
3. syncStepToGoalsBlock(backendGoalId, backendStepId, { date: dateStr })
  ↓
4. refreshGoalsAfterCalendarChange()
  ↓
5. loadWeeklySteps()
```

## Priority Colors Reference

| Priority | Frontend Value | Backend Value | Color |
|----------|---------------|---------------|-------|
| Critical | critical | important | Red (#ef4444) |
| Important | desirable | desirable | Orange (#f97316) |
| Attention | attention | attention | Yellow (#eab308) |
| Optional | optional | optional | Blue (#3b82f6) |

## API Endpoints Used

- `POST /api/rest/front/app/goals/steps/update/` - Update step properties
  - Fields: `goal_id`, `step_id`, `dt`, `is_complete`, `priority`, `time_duration`

- `GET /api/rest/front/app/goals/get/` - Load goals with steps
  - Params: `with_steps_data`, `category_filter`, `status_filter`, `page`, `per_page`

- `GET /api/rest/front/app/goals/steps/planned/get/` - Get planned steps for date range
  - Params: `date_from`, `date_to`

## Backend Workarounds

### Date Removal
Backend doesn't accept `null` for step date. Use special date `1700-01-01` to indicate "no date":

```javascript
dt: dateStr || '1700-01-01'
```

## Files Changed

- `src/views/Planning.vue`
  - Added `priorityFrontendToBackend` mapping constant
  - Added `timeDurationMap` reference in sync functions
  - Updated `syncStepToCalendar()` with format conversion
  - Updated `syncStepToGoalsBlock()` with format conversion
  - Updated `toggleStepComplete()` with calendar sync
  - Updated `scheduleStep()` with calendar sync
  - Updated `updateScheduledStep()` with proper priority conversion
  - Updated `updateTaskDateWithBackend()` with goals block sync
  - Updated `scheduleStepWithBackend()` with goals block sync

## Testing Checklist

- [ ] Change completion in calendar → Goals block updates
- [ ] Change completion in goals block → Calendar updates
- [ ] Drag step to different day in calendar → Goals block date updates
- [ ] Remove step from calendar → Goals block date clears
- [ ] Change date in goals block → Calendar adds/removes step
- [ ] Change priority in goals block → Calendar color updates correctly
- [ ] Change time in goals block → Calendar time badge updates
- [ ] Goal header counts update after any change

## Known Considerations

1. **Reactivity**: All sync functions mutate reactive objects directly. Vue 3/Pinia handles reactivity for nested objects.

2. **Race Conditions**: Backend calls are awaited before local sync to ensure data consistency.

3. **Fallback Data**: If step not found in target block during sync, function returns false without error.

4. **ID Resolution**: Always use backend IDs (`goal_id`, `step_id`) for cross-dataset matching.
