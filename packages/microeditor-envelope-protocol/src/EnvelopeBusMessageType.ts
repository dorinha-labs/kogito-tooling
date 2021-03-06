/*
 * Copyright 2020 Red Hat, Inc. and/or its affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export enum EnvelopeBusMessageType {
  REQUEST_LANGUAGE,
  RETURN_LANGUAGE,

  REQUEST_INIT,
  RETURN_INIT,

  REQUEST_CONTENT,
  RETURN_CONTENT,

  NOTIFY_SET_CONTENT_ERROR,
  NOTIFY_DIRTY_INDICATOR_CHANGE,
  NOTIFY_READY,

  REQUEST_RESOURCE_CONTENT,
  RETURN_RESOURCE_CONTENT,

  REQUEST_RESOURCE_LIST,
  RETURN_RESOURCE_LIST,

  REQUEST_PREVIEW,
  RETURN_PREVIEW,

  NOTIFY_EDITOR_UNDO,
  NOTIFY_EDITOR_REDO,
  NOTIFY_EDITOR_NEW_EDIT,
  NOTIFY_EDITOR_OPEN_FILE,
  NOTIFY_STATE_CONTROL_COMMAND_UPDATE,
  NOTIFY_CHANNEL_KEYBOARD_EVENT,

  NOTIFY_GUIDED_TOUR_USER_INTERACTION,
  NOTIFY_GUIDED_TOUR_REGISTER_TUTORIAL,
  REQUEST_GUIDED_TOUR_ELEMENT_POSITION,
  RETURN_GUIDED_TOUR_ELEMENT_POSITION
}
