class BookModel {
  int? code;
  bool? status;
  String? message;
  BookData? data;

  BookModel({this.code, this.status, this.message, this.data});

  BookModel.fromJson(Map<String, dynamic> json) {
    code = json['code'];
    status = json['status'];
    message = json['message'];
    data = json['data'] != null ? new BookData.fromJson(json['data']) : null;
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['code'] = this.code;
    data['status'] = this.status;
    data['message'] = this.message;
    if (this.data != null) {
      data['data'] = this.data!.toJson();
    }
    return data;
  }
}

class BookData {
  List<Books>? books;
  int? count;

  BookData({this.books, this.count});

  BookData.fromJson(Map<String, dynamic> json) {
    if (json['Books'] != null) {
      books = <Books>[];
      json['Books'].forEach((v) {
        books!.add(new Books.fromJson(v));
      });
    }
    count = json['count'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    if (this.books != null) {
      data['Books'] = this.books!.map((v) => v.toJson()).toList();
    }
    data['count'] = this.count;
    return data;
  }
}

class Books {
  String? sId;
  bool? isActive;
  String? description;
  String? createdAt;
  List<Images>? images;
  String? subject;
  String? class1;
  String? book;
  String? code;

  Books(
      {this.sId,
      this.isActive,
      this.description,
      this.createdAt,
      this.images,
      this.subject,
      this.class1,
      this.book,
      this.code});

  Books.fromJson(Map<String, dynamic> json) {
    sId = json['_id'];
    isActive = json['isActive'];
    description = json['description'];
    createdAt = json['createdAt'];
    if (json['images'] != null) {
      images = <Images>[];
      json['images'].forEach((v) {
        images!.add(new Images.fromJson(v));
      });
    }
    subject = json['subject'];
    class1 = json['class'];
    book = json['book'];
    code = json['code'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['_id'] = this.sId;
    data['isActive'] = this.isActive;
    data['description'] = this.description;
    data['createdAt'] = this.createdAt;
    if (this.images != null) {
      data['images'] = this.images!.map((v) => v.toJson()).toList();
    }
    data['subject'] = this.subject;
    data['class'] = this.class1;
    data['book'] = this.book;
    data['code'] = this.code;
    return data;
  }
}

class Images {
  String? url;
  String? name;
  String? iId;

  Images({this.url, this.name, this.iId});

  Images.fromJson(Map<String, dynamic> json) {
    url = json['url'];
    name = json['name'];
    iId = json['_id'] ;
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['url'] = this.url;
    data['name'] = this.name;
    if (this.iId != null) {
      data['_id'] = this.iId!;
    }
    return data;
  }
}

class Id {
  String? oid;

  Id({this.oid});

  Id.fromJson(Map<String, dynamic> json) {
    oid = json['$oid'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['$oid'] = this.oid;
    return data;
  }
}
