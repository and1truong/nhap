# Nháp #1: gõ Việt–Anh lẫn nhau và bảo toàn URL/code

Ngày nghiên cứu: 6 October 2026. Issue: https://github.com/and1truong/nhap/issues/1.

## Kết luận

Không nên đặt mục tiêu tự nhận diện Việt–Anh tuyệt đối. Cùng chuỗi phím list có thể có ý định list hoặc lít; last có thể là last hoặc lát; his có thể là his hoặc hí. Ba trường hợp này đã được replay, không chỉ lấy từ tài liệu quảng cáo. Kiểm tra âm tiết không đủ để quyết định ý định, còn từ điển/ngữ cảnh chỉ thay đổi xác suất.

Nháp nên ưu tiên ba việc: bảo vệ vùng kỹ thuật bằng quy tắc xác định được; giữ chuỗi phím gốc đủ lâu để phục hồi chính xác; cung cấp thao tác literal dễ dùng trên cả desktop và điện thoại. Khôi phục từ không hợp lệ nên là opt-in. Nhận diện ngữ cảnh nên tiếp tục nghiên cứu, chưa đưa vào default.

Phát hiện quan trọng ngoài dấu tiếng Việt: phím lặp có thể làm mất ký tự Latin. Với cấu hình kiểm tra chính tả và auto-restore được đo, cả lõi UniKey chính thức và OpenKey trả session thành sesion, password thành pasword, buffer thành bufer. Auto-restore của engine không đồng nghĩa bảo toàn byte hoặc mọi phím người dùng đã gõ.

## Phạm vi bằng chứng

| Thành phần | Phiên bản / cấu hình | Đã thực hiện | Giới hạn |
| --- | --- | --- | --- |
| Nháp | commit 54c97eb3b720439d5b519f80059bb261f2d3725d; Telex bật; classic; replacement mặc định | 140 chuỗi qua keyboard events của Chromium vào textarea thật; 25 chuỗi thao tác; build và 10 test hiện có | Chỉ Chromium desktop Linux |
| Chromium | 153.0.8010.0; Playwright 1.63.0; Node 24.19.0 | file URL; không cần mạng cho replay | Không đại diện Safari hoặc bàn phím iPhone |
| UniKey chính thức | core từ x-unikey 1.0.4; SHA-256 aa7dd444853538bcba0f24c4c19692c34d4553a1df213a260c2628a7116b2dd9 | Biên dịch C++; Telex, freeMarking bật, classic, macro tắt; ba profile: spelling tắt; spelling bật; spelling + restore bật | Không chạy bản UniKey Windows hiện hành |
| ibus-unikey | commit ede78c312e8c6ed96d0f653a12880d4671c929fe | Cùng adapter và ba profile để đối chiếu fork | Là core đã sửa đổi, không dùng làm đại diện chính cho UniKey |
| OpenKey | commit 89c2fd3bf258562f2349f89b49d81e2f140c3fc3; metadata versionName 2.0.3 | Core C++ với macOS key map; Telex, freeMark bật, classic, macro/Quick Telex/teencode tắt; ba profile spelling/restore tương tự | Không chạy macOS event tap hoặc kiểm thử native text replacement |
| Composition | 2 ca sự kiện tổng hợp trong 25 chuỗi thao tác | ASCII list thành lít; Unicode Tiếng giữ nguyên | Không phải evidence của IME thật |

Build nguồn cũ dùng tùy chọn tương thích compiler: X-Unikey -fpermissive và include cstring; OpenKey include algorithm. Không sửa logic engine. Adapters áp dụng backspace theo ký tự Unicode, thứ tự charData của OpenKey theo host macOS, và phát lại phím gây restore theo host. Đã đối chiếu các ca Telex cơ bản và phím lặp. Reference APIs xử lý ASCII input trong corpus; Unicode native/paste được kiểm tra ở luồng editor riêng.

Nguồn chính thức UniKey chỉ tới core trong gói x-unikey; trang nguồn cũng phân biệt core với source Windows 3.6 cũ. Vì vậy kết quả dưới đây là so sánh core đã pin, không phải lời khẳng định về mọi bản phát hành hoặc cấu hình của UniKey. Native macOS/Windows/iPhone còn chưa kiểm chứng.

## Corpus và phép đo

corpus.json có 140 ca tự thiết kế để gây khó cho engine: 16 ca mơ hồ; 33 từ Anh/thuật ngữ; 6 control phím lặp; 13 tên riêng; 33 ca tiếng Việt/profile/tiếng lóng; 21 URL/email/path/identifier; 10 vùng Markdown; 8 câu trộn. Có 26 ca được gán ý định tiếng Việt có dấu. Các nhãn literal, mixed, control và vietnamese là ý định khai báo của người viết test.

Một ca replay là gõ raw từng phím, ghi kết quả trước Space, thêm Space, ghi kết quả sau chốt và so với expected. Không coi thay đổi giữa chừng là lỗi nếu kết quả cuối đúng. Mismatch được đếm theo ca hoàn chỉnh, không theo mọi lần đặt dấu; ở câu trộn một mismatch có thể chứa nhiều từ sai. Không biến corpus cố tình khó này thành tỷ lệ lỗi của người dùng thực tế.

| Nhóm | Số ca | Nháp: không khớp ý định | UniKey chính thức: spelling bật, restore tắt | UniKey chính thức: spelling + restore bật | OpenKey: spelling + restore bật |
| --- | ---: | ---: | ---: | ---: | ---: |
| Mơ hồ, ý định Latin | 16 | 13 | 12 | 12 | 12 |
| Anh / thuật ngữ | 33 | 30 | 18 | 6 | 6 |
| Phím lặp có chủ ý | 6 | 0 | 1 | 1 | 1 |
| Tên riêng | 13 | 13 | 6 | 3 | 2 |
| Việt / profile / tiếng lóng | 33 | 1 | 2 | 2 | 1 |
| URL / email / path / identifier | 21 | 20 | 18 | 12 | 12 |
| Markdown | 10 | 10 | 8 | 8 | 10 |
| Câu trộn | 8 | 6 | 5 | 4 | 4 |

Riêng 26 ca có ý định tiếng Việt có dấu: Nháp, UniKey và OpenKey đều đạt 26/26 ở cấu hình restore được đo. Mismatch trong nhóm Việt lớn hơn chủ yếu do profile standalone w và chính sách tiếng lóng, không phải cùng một lỗi đặt dấu. Fork ibus có một vài khác biệt với nguồn chính thức; mọi output nằm trong results.json.

### Một số expected/actual tiêu biểu

Đầu ra dưới đây là sau chốt Space; chuỗi Space cuối đã bỏ khỏi bảng.

| Chuỗi phím | Ý định khai báo | Nháp | UniKey chính thức + restore | OpenKey + restore |
| --- | --- | --- | --- | --- |
| list | list | lít | lít | lít |
| last | last | lát | lát | lát |
| his | his | hí | hí | hí |
| google | google | gôgle | google | google |
| test | test | tét | tét | tét |
| session | session | sesion | sesion | sesion |
| password | password | pẳsod | pasword | pasword |
| buffer | buffer | bủfe | bufer | bufer |
| Paris | Paris | Pái | Pái | Pái |
| Hans | Hans | Hán | Hán | Hán |
| user_id | user_id | ủe_id | user_id | user_id |
| his@example.com | his@example.com | hí@eãmple.com | hí@example.com | hí@example.com |
| /usr/local/bin | /usr/local/bin | /ủ/local/bin | /ủ/local/bin | /ủ/local/bin |
| www.google.com | www.google.com | www.gôgle.com | ww.google.com | ww.google.com |
| AWS | AWS | Ắ | Ắ | Ắ |
| Tooi dungf Redis vaf Postgres | Tôi dùng Redis và Postgres | Tôi dùng Rédi và Pótge | Tôi dùng Redis và Postgres | Tôi dùng Redis và Postgres |
| Tooi xem list vaf class | Tôi xem list và class | Tôi xem lít và clas | Tôi xem lít và class | Tôi xem lít và class |

google ở hai core vẫn hiển thị gôgle trước Space rồi mới khôi phục. Nhìn kết quả giữa chừng và kết quả cuối là hai phép đo khác nhau. Khi chuỗi giống âm tiết Việt như test hoặc tên Paris/Hans, khôi phục không giải quyết được. Khi phím lặp đã đóng vai trò escape, kết quả phục hồi của reference engines có thể đã mất một phím: session, password và buffer là ba ca xác nhận, không suy đoán.

## Phân loại mơ hồ

1. Chuỗi tạo ra âm tiết không hợp lệ: có thể dùng grammar để khôi phục raw, ví dụ google và nhiều thuật ngữ. Cần validator cả onset, nucleus, coda, tone và tổ hợp hợp lệ; kiểm tra một tập chữ cái không đủ. Không dùng việc từ không nằm trong từ điển làm đồng nghĩa không phải tiếng Việt.
2. Chuỗi tạo ra âm tiết hợp lệ: list/lít, last/lát, his/hí, test/tét, car/cả. Grammar không giải được; từ điển hai ngôn ngữ cũng có giao nhau. Đổi chính sách từ ưu tiên Việt sang ưu tiên Anh sẽ đổi false positive thành false negative.
3. Từ không cần biến đổi: can, ban, than. Đồng hình không tự gây hỏng văn bản; chỉ quan trọng nếu tính năng sau này tự thêm dấu hoặc học từ ngữ cảnh.
4. Tên riêng, từ mượn và viết tắt: Paris/Hans/AWS cho thấy viết hoa không phải bảo đảm literal. Không bỏ qua mọi từ viết hoa, vì sẽ làm hỏng Vieetj và DDUOWNGF. Chỉ dùng allowlist do người dùng chủ động khai báo, hoặc chế độ literal.
5. Phím lặp: bass và session cho thấy vấn đề không chỉ là ngôn ngữ; cùng hai phím có thể là chữ lặp thật hoặc lệnh bỏ biến đổi. Không suy ngược raw từ output đã mất phím.
6. Tiếng lóng / tiếng Việt thiếu dấu: zui zer, thik, ko. Grammar chuẩn dễ coi là không hợp lệ. Giữ tùy chọn validator tắt; nếu có profile teencode phải có corpus và quy tắc riêng. Không biến bài toán Telex thành tự sửa chính tả hoặc khôi phục dấu bị thiếu.

## Hành vi editor đã xác nhận

Liên kết implementation được pin theo commit: https://github.com/and1truong/nhap/blob/54c97eb3b720439d5b519f80059bb261f2d3725d/index.html.

| Mức ưu tiên | Evidence | Nguyên nhân / vị trí | Đánh giá |
| --- | --- | --- | --- |
| P1 | Gõ URL issue #1 thành https://github.com/and1truong/nhap/isúe/1; 20/21 ca kỹ thuật bị đổi | transformInsert, dòng 257–267; wordChar dòng 108 chỉ nhận chữ/mark; không có policy vùng kỹ thuật | Khoảng trống bảo toàn nội dung, không phải promise auto-detect hiện có |
| P1 | Inline code list class foo thành lít clas fô; 10/10 ca Markdown bị đổi; ;vn còn mở rộng trong code | transformInsert không kiểm tra vùng; tryReplacement dòng 277–291 chạy trước biến đổi; markdown preview độc lập | Thêm bảo vệ Telex thôi chưa đủ: replacement cũng phải theo vùng |
| P2 | list rồi Space rồi Escape vẫn là lít; Escape trước chữ đầu không có tác dụng | input dòng 306–308 xóa active ở delimiter; escapeWord dòng 292 chỉ xử lý active ở cuối caret | Hiện đúng theo mô tả active word; UX không đủ khi người dùng phát hiện muộn |
| P2 | lis rồi Escape rồi click cuối từ rồi t thành lít | pointerdown dòng 332 xóa active; transformInsert quét lại chữ hiển thị | Literal intent không tồn tại qua đổi con trỏ |
| P2 | Paste https://example.com/li rồi gõ st thành https://example.com/lít | transformInsert quét seed từ văn bản đã có mà không xét vùng hoặc provenance | Paste nguyên vẹn không bảo đảm sửa tiếp nguyên vẹn |
| P2 | F2 sau list giữ lít; F2 trước lis rồi bật lại rồi t tạo lít | toggleTelex/applyConfig dòng 359–363; xóa active rồi quét lại seed | F2 là bật/tắt Telex cho input; không phải lệnh restore hoặc literal toàn phần |
| P2 | F2 trước ;vn Space vẫn mở rộng thành Việt Nam | shortcutsInEnglish mặc định bật; tryReplacement | English mode và literal mode cần hai ngữ nghĩa rõ ràng; đây là hành vi đã cấu hình, không gọi là bug |

Thao tác đã đo: Escape khi active cần 1 thao tác và phục hồi list chính xác; lisst và lasst cần 1 phím bổ sung so với từ Latin định gõ; lasts không thoát và vẫn thành lát, vì hai phím s không liền nhau trong raw. F2 trước một đoạn rồi F2 sau đoạn cần 2 thao tác cho Telex, nhưng không vô hiệu hóa replacement. Đây là chi phí của các chuỗi quan sát được, không phải thống kê số thao tác tối thiểu cho mọi ca.

Escape trả raw keystrokes, không trả dạng Latin bỏ dấu. Gõ lasst đang hiển thị last, Escape sẽ trả lasst. Người dùng đã gõ thừa s để escape thì không nên coi thao tác này là đồng nghĩa với giữ last. Đổi ý định, escape bằng phím lặp và hoàn tác là ba thao tác khác nhau.

## So sánh chính sách

| Chính sách | Lợi ích | Đánh đổi | Đề xuất |
| --- | --- | --- | --- |
| Bật/tắt Telex thủ công | Ý định rõ; giữ raw nếu chọn trước | Quên đổi; mobile không có F2; macro có thể vẫn chạy | Giữ; làm rõ không phải literal toàn phần |
| Escape active word | Phục hồi chính xác raw đang giữ; 1 thao tác | Mất sau Space/click; chỉ một từ | Mở rộng UX restore có provenance và nút chạm |
| Phím lặp | Thói quen Telex phổ biến; nhanh | Cần biết vị trí; chữ lặp thật bị hiểu là escape; khác khi spellcheck bật | Giữ profile hiện có; không dùng làm cơ chế bảo toàn duy nhất |
| Grammar restore sau chốt | Cứu google và nhiều thuật ngữ; không cần mạng hoặc model | Không giải list/his; tiếng lóng/tên có thể bị trả raw; cần xét phím lặp | Opt-in, hiển thị thay đổi và undo được |
| Từ điển ưu tiên Anh | Giảm sửa thuật ngữ quen thuộc | list/his tiếng Việt bị bỏ qua; OOV, từ mượn, tên riêng; kích thước và nguồn dữ liệu | Không default; allowlist thủ công hẹp có thể thêm sau |
| Suy luận từ ngữ cảnh | Có thể giảm thao tác trong đoạn dài | Code-switch, quote, tên riêng, câu ngắn; lỗi liên tiếp nếu trạng thái học sai | Nghiên cứu tiếp; không tự học từ output máy đã đổi |
| Vùng literal có cú pháp hoặc explicit | Quyết định được; bảo toàn cả số/dấu câu/macro | Cần parser và xử lý dấu mở chưa đóng; muốn gõ Việt trong comment phải override | Default cho vùng kỹ thuật rõ ràng; explicit override cho người dùng |

Đây là đánh giá thiết kế. Chỉ các engine/profile trong results.json đã được chạy; chưa implement hoặc benchmark một classifier ngữ cảnh, từ điển hay validator mới của Nháp. Không lấy số mismatch của reference engines để dự báo trực tiếp mức cải thiện của implementation tương lai.

## Thiết kế đề xuất

### Quy tắc ưu tiên

Input paste/import/replacement/native Unicode phải có provenance riêng; không suy rằng chúng là chuỗi phím ASCII thô. Không sửa trong composition đang diễn ra. Trên input mà web editor sở hữu, thứ tự quyết định: explicit lựa chọn người dùng cho vùng hoặc từ; chế độ literal toàn cục; vùng kỹ thuật đã xác định; Telex theo cấu hình; grammar restore opt-in khi chốt. Macro chỉ chạy nếu effective policy cho phép, và bị tắt trong literal. Explicit chế độ Việt trong một vùng code cho phép Telex để gõ comment; macro vẫn cần lựa chọn riêng, không tự bật lại.

Chế độ English hiện có nghĩa là Telex tắt, macro theo settings. Chế độ Literal mới nghĩa là không Telex, không macro, giữ nội dung input theo nguyên văn. Native OS autocorrect trước khi web nhận input nằm ngoài bảo đảm raw keystrokes; phải nói rõ phạm vi input mà web thực sự quan sát được.

### Phục hồi và dữ liệu gốc

Lưu theo edit transaction: raw input mà web quan sát, output, vùng start/end, provenance, effective policy và document revision. Dùng mapping raw-to-rendered, không suy raw từ Unicode; hỗ trợ phím lặp và dấu câu. Xác nhận nội dung/range vẫn đúng trước khi restore; không dùng cache để ghi đè từ đã sửa.

Escape khi active trả raw và giữ literal tới ranh giới từ. Nút Trả chữ gốc dùng cùng action. Sau delimiter, cho phép action này khôi phục từ vừa chốt nếu chưa có edit/selection khiến provenance mất hiệu lực; giữ delimiter. Chỉ giữ cache hẹp và có giới hạn, không lưu lịch sử phím vô hạn. Nếu không có raw, thông báo không còn chữ gốc hoặc chỉ cho undo; không giả tạo một chuỗi gốc bằng cách bỏ dấu.

Đổi F2 không khôi phục hồi tố. Chốt hoặc đóng active transaction ở thời điểm đổi mode, giữ dạng đang hiển thị, và không tự quét lại phần trước ranh giới mode khi bật lại. Restore là action riêng. Explicit literal intent phải được giữ qua caret moves trên vùng còn nguyên; khi range đã đổi phải kiểm tra revision và invalidate hợp lý. Hoàn tác/redo cần chứa cả text, caret và policy state. Phối hợp nghiên cứu #4.

### Bảo vệ URL/email/path

Default bảo vệ các dấu hiệu mạnh: scheme URL đã nhận diện, tiền tố www., email khi xuất hiện @, đường dẫn bắt đầu /, ./, ../ hoặc drive + colon + slash/backslash, và Markdown link destination. Phạm vi literal chạy tới ranh giới đúng của token/destination, không kết thúc ở mọi dấu chấm, gạch dưới hoặc slash. Luôn tắt replacement cùng Telex trong phạm vi này.

Nhận diện có thể đến muộn: his đã thành hí trước @; google đã thành gôgle trước dấu chấm. Khi bắt được dấu hiệu kỹ thuật, chỉ rollback phần thuộc transaction có raw còn hợp lệ; không sửa lịch sử văn bản đã dán hoặc đã chốt mà không có provenance. Sau đó giữ cả vùng literal. Không áp normalize NFC vào phần input cần bảo toàn nguyên văn chỉ để phục vụ engine.

Bare google.com, notes.md và identifier viết thường không có delimiter rõ có thể mơ hồ với văn xuôi/viết tắt. Để explicit literal làm đường đảm bảo; nhận diện bare domain/TLD/file extension/camelCase/snake_case nên opt-in và có corpus false positive. Không dùng quy tắc thấy một dấu chấm là tắt Việt cả phần còn lại, hoặc thấy chữ hoa là giữ Latin.

### Bảo vệ Markdown đang gõ

Fenced code: theo loại backtick/tilde, độ dài fence và container. Fence đóng phải cùng loại, đủ dài; mở chưa đóng bảo vệ tới cuối container/document. Bảo vệ cả info string như javascript. Code span: delimiter mở/đóng cùng độ dài; xử lý multi-backtick và backtick trong nội dung. Link label vẫn cho gõ Việt; destination là literal. Xét code trong list/blockquote, escaped backticks, insertion ở giữa document và caret quay lại vùng đã có.

Markdown hợp lệ cuối cùng và vùng code đang soạn không hoàn toàn giống nhau: inline backtick chưa đóng có thể chỉ là punctuation theo CommonMark. Đề xuất một vùng provisional dễ thấy trong lúc gõ, bounded theo dòng khi chưa có delimiter đóng; không biến một backtick thất lạc thành trạng thái literal vô hạn. Khi span đã đóng hợp lệ có thể xét qua newline theo spec. Xóa hoặc đổi delimiter chỉ đổi policy cho input tương lai, không âm thầm replay lại toàn bộ nội dung.

Scanner vùng soạn phải tách khỏi renderer preview; renderer hiện tại không phải CommonMark đầy đủ và render một code block không chứng minh engine input đã bảo vệ nó. Có thể bundle scanner/parser lúc build để output vẫn một file HTML, không gọi CDN/model/API lúc chạy. Chưa chọn dependency cụ thể; cần cân nhắc kích thước, grammar và bảo trì ở implementation ticket.

### Grammar restore opt-in

Giữ engine Telex deterministic hiện có. Validator độc lập trả valid, invalid hoặc unknown với phiên bản rules cụ thể. Chỉ quyết định khi chốt một token có raw; không tắt sớm chỉ vì prefix chưa là một âm tiết hoàn chỉnh. Free tone placement, phím tạo hình sau phụ âm và profile teencode ảnh hưởng tập prefix hợp lệ.

Chỉ invalid chắc chắn trong profile được chọn mới có thể khôi phục raw; unknown giữ output để giảm sửa nhầm. Sau auto-restore, người dùng có thể chọn lại dạng Việt bằng một action, không bật lại classifier trong cùng transaction và gây flip-flop. Đặc biệt kiểm thử raw có phím lặp: không lấy output đã rút mất một ký tự làm raw mới. Từ mơ hồ valid giữ ưu tiên Việt theo profile hiện tại và luôn có restore explicit.

## Acceptance criteria cho follow-up

1. Literal scopes: inline/fenced code, link destination, URL scheme/www/email và path rõ ràng giữ nguyên input; Telex và macro đều bypass. Link label vẫn gõ Việt. Hỗ trợ fence dài/ngắn, tilde, escape, open fence, code trong containers, caret/selection giữa document, paste rồi sửa tiếp. His trước @ phục hồi đúng khi còn provenance. Bare domain/identifier ambiguity được documented và không hứa nhận diện tuyệt đối. Explicit VI override cho comment. Một file HTML chạy offline.
2. Restore và mode boundary: nút chạm dùng chung Escape action; restore active và từ vừa chốt với raw hợp lệ; giữ delimiter; stale revision không được ghi đè. Phân biệt raw restore với phím lặp. Literal intent qua caret; F2 future-only và không rescan qua mode boundary. Undo/redo bảo toàn text/caret/policy. English macro behavior và Literal behavior có test riêng. Config roundtrip nếu thêm mode/settings; phối hợp #4 và #6.
3. Grammar restore opt-in: default tắt; validator tách engine; corpus valid/invalid/unknown/versioned; 26 ca Việt không regress; list/last/his không tự chọn Anh; session/password/buffer không mất phím khi restore; unknown/tên/teencode không bị dictionary sửa nhầm; đúng profile classic/modern; có one-action đảo ngược, không flip-flop. Không network/model; chạy offline. Tích hợp config import/export với backward compatibility.

Context-aware auto-detect chưa được chốt để triển khai. Cần held-out corpus có tần suất tự nhiên và nhiều người gõ, đo false conversion, missed Vietnamese và action cost theo token, không chỉ đo accuracy toàn chuỗi. Không auto-learn từ các biến đổi mà engine tự tạo. Không coi nghiệm đúng trên 140 ca đã đọc là đủ cho bật default.

## Việc còn mở và điều kiện đóng #1

- Cần chạy corpus trên bản UniKey Windows và OpenKey macOS thật; ghi exact release/version, OS/browser, Telex profile, spelling/restore/Quick Telex. So sánh cùng cấu hình trước khi kết luận khác engine. Có native-recorder.html để ghi event trace và final text vào JSON.
- Cần Safari/iOS thật cho action Trả chữ gốc và IME lifecycle; phối hợp #2 và #3. Mobile viewport hoặc synthetic composition không thay thế thiết bị thật.
- Cần human evaluation cho grammar restore và bất kỳ heuristic ngữ cảnh nào. Corpus hiện tại phục vụ hồi quy và phản ví dụ, không đại diện phân phối thực tế.
- Kết luận chính sách và evidence core đã có; tiêu chí native comparison của issue chưa đủ, nên giữ #1 mở với checklist này. Không tuyên bố nghiên cứu đã bao phủ mọi hệ điều hành.

## Nguồn

1. UniKey source và gói core chính thức: https://www.unikey.org/source.html và https://www.unikey.org/linux.html. Đã tải archive x-unikey 1.0.4 từ liên kết chính thức; hash ở trên.
2. UniKey manual 3.5, mục 3.6: https://www.unikey.org/support/ukmanual.html. Tài liệu lịch sử mô tả phím lặp và Ctrl; không thay thế test bản hiện hành. Ví dụ guitarr trong manual khác profile spellcheck bật đã đo, minh họa cần pin settings.
3. OpenKey source: https://github.com/tuyenvm/OpenKey/tree/89c2fd3bf258562f2349f89b49d81e2f140c3fc3/Sources/OpenKey/engine. Engine.cpp có spelling/restore; host macOS OpenKey.mm mô tả áp kết quả. README mô tả smart switch theo ứng dụng, không đồng nghĩa nhận diện ngôn ngữ từng từ.
4. ibus-unikey fork: https://github.com/vn-input/ibus-unikey/tree/ede78c312e8c6ed96d0f653a12880d4671c929fe. README nói dùng modified UniKey engine; dùng như cross-check, không thay nguồn chính thức.
5. VietTelex guide: https://viettelex.com/en/guide/?os=macos. Nhà cung cấp mô tả Vietnamese wins ở từ mơ hồ, auto-restore và context-aware. Chưa chạy binary VietTelex; không tính các tuyên bố này là kết quả đo.
6. CommonMark 0.31.2, mục 4.5 và 6.1: https://spec.commonmark.org/0.31.2/. Dùng cho quy tắc fence/span; policy vùng provisional khi đang gõ là đề xuất editor của báo cáo này.
7. W3C Input Events Level 2: https://www.w3.org/TR/input-events-2/. Đây là Working Draft; phân biệt composition/input/replacement là cơ sở thiết kế, không là bằng chứng mọi browser triển khai đúng.

Toàn bộ raw/expected/live/committed/profile output có trong corpus.json, results.json, summary.json và action-results.json. README.md hướng dẫn chạy lại và nêu giới hạn. Chưa sửa implementation sản phẩm.
