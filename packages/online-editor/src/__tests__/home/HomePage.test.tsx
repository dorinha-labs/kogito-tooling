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

import * as React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { HomePage } from "../../home/HomePage";
import { usingTestingGlobalContext } from "../testing_utils";
import { File as UploadFile } from "@kogito-tooling/embedded-editor";
import { GithubService } from "../../common/GithubService";

const mockHistoryPush = jest.fn();

jest.mock("react-router", () => {
  const ActualReactRouter = require.requireActual("react-router");
  return {
    ...ActualReactRouter,
    useHistory: () => ({
      push: mockHistoryPush
    })
  };
});

declare global {
  namespace NodeJS {
    interface Global {
      fetch: Promise<Response>;
    }
  }
}

describe("HomePage", () => {
  describe("open from url", () => {
    describe("invalid", () => {
      test("should show an invalid url error", () => {
        const { getByText, getByTestId } = render(
          usingTestingGlobalContext(<HomePage onFileOpened={(file: UploadFile) => true} />).wrapper
        );

        const invalidUrls = [".", "something", "something.com"];

        invalidUrls.forEach(url => {
          fireEvent.change(getByTestId("url-text-input"), { target: { value: url } });
          expect(getByText(`This URL is not valid (don't forget "https://"!).`)).toBeTruthy();
        });
      });

      test("should show an invalid extension error", async () => {
        const { getByText, getByTestId } = render(
          usingTestingGlobalContext(<HomePage onFileOpened={(file: UploadFile) => true} />).wrapper
        );

        const urlsInvalidFileExtension = [
          "https://github.com/something.test",
          "https://github.com/test/test/blob/test/README.md",
          "https://dropbox.com/test.png"
        ];

        urlsInvalidFileExtension.forEach(url => {
          fireEvent.change(getByTestId("url-text-input"), { target: { value: url } });
          expect(getByText(`File type on the provided URL is not supported.`)).toBeTruthy();
        });
      });

      test("should show a not found url - github", async () => {
        const githubService = new GithubService();
        jest.spyOn(githubService, "checkFileExistence").mockImplementation((url: string) => Promise.resolve(false));

        const { findByText, getByTestId } = render(
          usingTestingGlobalContext(<HomePage onFileOpened={(file: UploadFile) => true} />, { githubService }).wrapper
        );

        const urlsNotFound = [
          "https://github.com/test/test/test.dmn",
          "https://github.com/test/test/test.bpmn",
          "https://github.com/test/test/test.bpmn2"
        ];

        for (const url of urlsNotFound) {
          fireEvent.change(getByTestId("url-text-input"), { target: { value: url } });
          expect(await findByText(`This URL does not exist.`)).toBeTruthy();
        }
      });

      test("should show a not found url error - generic", async () => {
        const originalFetch = window.fetch;
        window.fetch = jest.fn().mockImplementation(() => Promise.resolve({ ok: false }));

        const { findByText, getByTestId } = render(
          usingTestingGlobalContext(<HomePage onFileOpened={(file: UploadFile) => true} />).wrapper
        );

        const urlsNotFound = [
          "https://dl.dropboxusercontent.com/s/teste/teste.dmn",
          "https://dl.dropboxusercontent.com/s/teste/teste.bpmn",
          "https://dl.dropboxusercontent.com/s/teste/teste.bpmn2"
        ];

        for (const url of urlsNotFound) {
          fireEvent.change(getByTestId("url-text-input"), { target: { value: url } });
          expect(await findByText(`This URL does not exist.`)).toBeTruthy();
        }

        window.fetch = originalFetch;
      });

      test("should show a can't open the file error", async () => {
        const originalFetch = window.fetch;
        window.fetch = jest.fn().mockImplementation(() => Promise.reject());

        const { findByText, getByTestId } = render(
          usingTestingGlobalContext(<HomePage onFileOpened={(file: UploadFile) => true} />).wrapper
        );

        const urlsNotFound = ["https://google.com/teste.dmn", "https://dropbox.com/teste.bpmn"];

        for (const url of urlsNotFound) {
          fireEvent.change(getByTestId("url-text-input"), { target: { value: url } });
          expect(
            await findByText(`This URL cannot be opened because it doesn't allow other websites to access it.`)
          ).toBeTruthy();
        }

        window.fetch = originalFetch;
      });

      test("should show an invalid gist error", async () => {
        const githubService = new GithubService();
        jest
          .spyOn(githubService, "getGistRawUrlFromId")
          .mockImplementation((url: string) => Promise.reject());

        const { findByText, getByTestId } = render(
          usingTestingGlobalContext(<HomePage onFileOpened={(file: UploadFile) => true} />, { githubService }).wrapper
        );

        fireEvent.change(getByTestId("url-text-input"), { target: { value: "https://gist.github.com/test/aaaa" } });
        expect(await findByText(`Enter a valid Gist URL.`)).toBeTruthy();
      });

      test("should show an invalid gist error", async () => {
        const githubService = new GithubService();
        jest
          .spyOn(githubService, "getGistRawUrlFromId")
          .mockImplementation((url: string) => Promise.resolve("https://gist.githubusercontent.com/test.png"));

        const { findByText, getByTestId } = render(
          usingTestingGlobalContext(<HomePage onFileOpened={(file: UploadFile) => true} />, { githubService }).wrapper
        );

        fireEvent.change(getByTestId("url-text-input"), { target: { value: "https://gist.github.com/test/aaaa" } });
        expect(await findByText(`File type on the provided gist is not supported.`)).toBeTruthy();
      });
    });

    describe("valid", () => {
      test("should enable the open from source button - gist", async () => {
        const githubService = new GithubService();
        jest
          .spyOn(githubService, "getGistRawUrlFromId")
          .mockImplementation((url: string) => Promise.resolve("https://gist.githubusercontent.com/test.dmn"));

        const { getByTestId } = render(
          usingTestingGlobalContext(<HomePage onFileOpened={(file: UploadFile) => true} />, { githubService }).wrapper
        );

        fireEvent.change(getByTestId("url-text-input"), { target: { value: "https://gist.github.com/test/aaaa" } });
        await waitFor(() => expect(getByTestId("open-url-button")).not.toHaveAttribute("disable"));
      });

      test("should enable the open from source button - github", async () => {
        const githubService = new GithubService();
        jest.spyOn(githubService, "checkFileExistence").mockImplementation((url: string) => Promise.resolve(true));

        const { getByTestId } = render(
          usingTestingGlobalContext(<HomePage onFileOpened={(file: UploadFile) => true} />, { githubService }).wrapper
        );

        fireEvent.change(getByTestId("url-text-input"), { target: { value: "https://github.com/test/test/test.dmn" } });
        await waitFor(() => expect(getByTestId("open-url-button")).not.toHaveAttribute("disable"));
      });

      test("should enable the open from source button - generic", async () => {
        const originalFetch = window.fetch;
        window.fetch = jest.fn().mockImplementation(() => Promise.resolve({ ok: true }));

        const { getByTestId } = render(
          usingTestingGlobalContext(<HomePage onFileOpened={(file: UploadFile) => true} />).wrapper
        );

        fireEvent.change(getByTestId("url-text-input"), {
          target: { value: "https://dl.dropboxusercontent.com/s/teste/teste.dmn" }
        });
        await waitFor(() => expect(getByTestId("open-url-button")).not.toHaveAttribute("disable"));

        window.fetch = originalFetch;
      });
    });
  });
});
