import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog/dialog";
import { Button } from "@/components/ui/button/button";
import React from "react";
import darkLogo from "@public/images/dark+logo.png";
import Image from "next/image";
export default function TermsAndPrivacyDialog({open, setOpen} : {open: boolean, setOpen: (open: boolean) => void}) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
                      <Image src={darkLogo} alt="Logo" className="w-50 h-auto mb-4" />
                      <p>Điều khoản sử dụng & Chính sách bảo mật</p>
          </DialogTitle>
          <DialogDescription>
            Vui lòng đọc kỹ các điều khoản sử dụng và chính sách bảo mật trước khi sử dụng dịch vụ của chúng tôi.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm text-gray-700">
          <h2 className="font-bold text-base mt-4">1. Điều khoản sử dụng</h2>
          <p>
            Khi sử dụng website này, bạn đồng ý tuân thủ các điều khoản và điều kiện được quy định tại đây. Vui lòng không sử dụng dịch vụ nếu bạn không đồng ý với bất kỳ điều khoản nào.
          </p>
          <ul className="list-disc pl-6">
            <li>Không sử dụng website cho mục đích bất hợp pháp.</li>
            <li>Không thu thập, sử dụng thông tin cá nhân của người khác khi chưa được phép.</li>
            <li>Không phát tán nội dung vi phạm pháp luật hoặc thuần phong mỹ tục.</li>
          </ul>
          <h2 className="font-bold text-base mt-4">2. Chính sách bảo mật</h2>
          <p>
            Chúng tôi cam kết bảo vệ thông tin cá nhân của bạn. Mọi thông tin thu thập được chỉ sử dụng cho mục đích cung cấp dịch vụ và sẽ không chia sẻ cho bên thứ ba khi chưa có sự đồng ý của bạn.
          </p>
          <ul className="list-disc pl-6">
            <li>Thông tin cá nhân được bảo mật tuyệt đối.</li>
            <li>Bạn có quyền yêu cầu chỉnh sửa hoặc xóa thông tin cá nhân bất cứ lúc nào.</li>
            <li>Chúng tôi sử dụng các biện pháp bảo mật phù hợp để bảo vệ dữ liệu của bạn.</li>
          </ul>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="default">Đóng</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
