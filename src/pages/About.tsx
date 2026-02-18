import { Layout } from '@/components/layout/Layout';

export default function About() {
  return (
    <Layout>
      <div className="container py-16">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-3xl font-bold text-foreground md:text-4xl">
            giới thịu
          </h1>
          <div className="mt-8 space-y-6 text-muted-foreground">
            <p>
              đây là web giúp bạn trở thành hề mạng với tuyển tập những văn mẫu 
              nhảm nhí, meme vô bổ, nói chung là chẳng có giá trị gì cả
            </p>
            
            <h2 className="text-xl font-semibold text-foreground">tính năng</h2>
            <ul className="list-inside list-disc space-y-2">
              <li>tìm kiếm theo keywords, chính xác thì hên xui nhưng méo mó có còn hơn không</li>
              <li>copy và paste vào box chat, tránh ngắt quãng tiếng cười</li>
            </ul>

            <h2 className="text-xl font-semibold text-foreground">xài sao?</h2>
            <ul className="list-inside list-disc space-y-2">
              <li>sử dụng <code className="rounded bg-muted px-1.5 py-0.5">@text</code> hoặc <code className="rounded bg-muted px-1.5 py-0.5">@image</code> để lọc nội dung là hình ảnh hoặc văn bản</li>
              <li>kết hợp: <code className="rounded bg-muted px-1.5 py-0.5">banh, mi @text</code></li>
            </ul>

            <h2 className="text-xl font-semibold text-foreground">disclaimer</h2>
            <p>
              nội dung được thu thập từ các nguồn công khai trên mạng xã hội, 
              nếu nó vô tình trùng khớp với các sự kiện, nhân vật hoặc hiện 
              tượng thực tế, điều đó hoàn toàn ngẫu nhiên và không có chủ đích
            </p>
            <p>
              nội dung có thể chứa thông tin không phù hợp với mọi đối tượng,
              vì vậy hãy cân nhắc trước khi sử dụng, nếu có nội dung quá phản 
              cảm xin hãy liên hệ để mình gỡ bỏ
            </p>
            <p>
              nếu bạn là chủ sở hữu của một nội dung nào đó và không muốn nó
              xuất hiện ở đây, hãy liên hệ với mình để được gỡ bỏ
            </p>
            <p>
              <a href="mailto:contact.tantranquoc@gmail.com" className="text-foreground underline hover:no-underline">
                contact.tantranquoc@gmail.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
