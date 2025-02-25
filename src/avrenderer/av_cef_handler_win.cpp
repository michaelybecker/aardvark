// Copyright (c) 2013 The Chromium Embedded Framework Authors. All rights
// reserved. Use of this source code is governed by a BSD-style license that
// can be found in the LICENSE file.

#include "av_cef_handler.h"

#include <windows.h>
#include <string>

#include "include/cef_browser.h"

void CAardvarkCefHandler::PlatformTitleChange(CefRefPtr<CefBrowser> browser,
                                        const CefString& title) 
{
	  CefWindowHandle hwnd = browser->GetHost()->GetWindowHandle();
	  SetWindowText(hwnd, std::string(title).c_str());
}
